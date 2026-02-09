'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Radar,
  Lock,
  Loader2,
  Search,
  ArrowUpRight,
  MessageSquare,
  ThumbsUp,
  Clock,
  ExternalLink,
  DollarSign,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { EQUIPMENT_TYPES, US_STATES } from '@/lib/constants'

interface RedditPost {
  id: string
  title: string
  selftext: string
  subreddit: string
  author: string
  url: string
  permalink: string
  score: number
  num_comments: number
  created_utc: number
  link_flair_text: string | null
}

interface CraigslistListing {
  title: string
  url: string
  price: string
  location: string
}

type ActiveTab = 'all' | 'reddit' | 'craigslist'

export default function SmartSearchPage() {
  const [tier, setTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [equipmentType, setEquipmentType] = useState('any')
  const [state, setState] = useState('')
  const [activeTab, setActiveTab] = useState<ActiveTab>('all')
  const [redditResults, setRedditResults] = useState<RedditPost[]>([])
  const [craigslistResults, setCraigslistResults] = useState<CraigslistListing[]>([])
  const [searchMeta, setSearchMeta] = useState<{
    redditTotal: number
    craigslistTotal: number
    craigslistRegion: string
    subredditsSearched: string[]
    redditError?: string
    craigslistError?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const { profile } = await response.json()
          setTier(profile?.subscription_tier || 'free')
        }
      } catch {
        setTier('free')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSearch = async () => {
    if (!query && equipmentType === 'any' && !state) {
      setError('Please enter a search query, select an equipment type, or choose a state.')
      return
    }

    setSearching(true)
    setError(null)
    setRedditResults([])
    setCraigslistResults([])
    setSearchMeta(null)

    try {
      const response = await fetch('/api/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, equipmentType, state }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Search failed')
      }

      const data = await response.json()
      setRedditResults(data.reddit?.posts || [])
      setCraigslistResults(data.craigslist?.listings || [])
      setSearchMeta({
        redditTotal: data.reddit?.totalResults || 0,
        craigslistTotal: data.craigslist?.totalResults || 0,
        craigslistRegion: data.craigslist?.region || '',
        subredditsSearched: data.reddit?.subredditsSearched || [],
        redditError: data.reddit?.error,
        craigslistError: data.craigslist?.error,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const formatTimeAgo = (utcSeconds: number) => {
    const now = Date.now() / 1000
    const diff = now - utcSeconds
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
    if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`
    return `${Math.floor(diff / 31536000)}y ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const hasAccess = tier === 'pro' || tier === 'enterprise'
  const totalResults = (searchMeta?.redditTotal || 0) + (searchMeta?.craigslistTotal || 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Smart Search</h1>
        <p className="text-gray-500">
          Cross-reference multiple platforms to find vendors and equipment listings.
        </p>
      </div>

      {!hasAccess ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Radar className="h-5 w-5 text-orange-500" />
                  Multi-Platform Search
                </CardTitle>
                <Badge variant="secondary">Pro Feature</Badge>
              </div>
              <CardDescription>
                Search across Reddit, Craigslist, and other platforms simultaneously.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upgrade to Pro
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Smart Search is available on the Pro plan. Upgrade to search across
                  Reddit, Craigslist, and other platforms simultaneously.
                </p>
                <Link href="/billing">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reddit</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-500">
                Search r/heavyequipment, r/construction, and related subreddits.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Craigslist</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-500">
                Monitor heavy equipment listings across all US regions.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Marketplace Monitoring</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-500">
                Get alerts when new listings match your criteria.
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Search Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radar className="h-5 w-5 text-orange-500" />
                Multi-Platform Search
              </CardTitle>
              <CardDescription>
                Search Reddit and Craigslist simultaneously for equipment vendors and listings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="query">Search Query</Label>
                  <Input
                    id="query"
                    placeholder="e.g., used excavator, Cat equipment for sale..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Equipment Type</Label>
                  <Select value={equipmentType} onValueChange={setEquipmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {EQUIPMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any State</SelectItem>
                      {US_STATES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleSearch}
                  disabled={searching}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {searching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching platforms...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search All Platforms
                    </>
                  )}
                </Button>

                {(query || equipmentType !== 'any' || state) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery('')
                      setEquipmentType('any')
                      setState('')
                      setRedditResults([])
                      setCraigslistResults([])
                      setSearchMeta(null)
                      setError(null)
                      setActiveTab('all')
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* Results Tabs & Summary */}
          {searchMeta && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    Found <strong className="text-gray-900">{totalResults}</strong> results across platforms
                  </span>
                </div>

                {/* Platform Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      activeTab === 'all'
                        ? 'bg-white text-gray-900 shadow-sm font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    All ({totalResults})
                  </button>
                  <button
                    onClick={() => setActiveTab('craigslist')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      activeTab === 'craigslist'
                        ? 'bg-white text-gray-900 shadow-sm font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Craigslist ({searchMeta.craigslistTotal})
                  </button>
                  <button
                    onClick={() => setActiveTab('reddit')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      activeTab === 'reddit'
                        ? 'bg-white text-gray-900 shadow-sm font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Reddit ({searchMeta.redditTotal})
                  </button>
                </div>
              </div>

              {/* Platform errors */}
              {searchMeta.redditError && (activeTab === 'all' || activeTab === 'reddit') && (
                <p className="text-sm text-amber-600">Reddit: {searchMeta.redditError}</p>
              )}
              {searchMeta.craigslistError && (activeTab === 'all' || activeTab === 'craigslist') && (
                <p className="text-sm text-amber-600">Craigslist: {searchMeta.craigslistError}</p>
              )}
            </div>
          )}

          {/* Craigslist Results */}
          {(activeTab === 'all' || activeTab === 'craigslist') && craigslistResults.length > 0 && (
            <div className="space-y-3">
              {activeTab === 'all' && (
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Craigslist Listings
                  {searchMeta?.craigslistRegion && (
                    <span className="font-normal text-gray-400 ml-2 normal-case">
                      {searchMeta.craigslistRegion} region
                    </span>
                  )}
                </h3>
              )}
              {craigslistResults.map((listing, i) => (
                <Card key={`cl-${i}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-purple-100 text-purple-700 text-xs shrink-0">
                            Craigslist
                          </Badge>
                          {listing.location && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {listing.location}
                            </span>
                          )}
                        </div>

                        <a
                          href={listing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-medium text-gray-900 hover:text-orange-600 line-clamp-2"
                        >
                          {listing.title}
                        </a>

                        {listing.price && listing.price !== 'N/A' && (
                          <div className="flex items-center gap-1 mt-1 text-sm font-semibold text-green-700">
                            <DollarSign className="h-3.5 w-3.5" />
                            {listing.price.replace('$', '')}
                          </div>
                        )}
                      </div>

                      <a
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button size="sm" variant="outline" className="h-8 px-2">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Reddit Results */}
          {(activeTab === 'all' || activeTab === 'reddit') && redditResults.length > 0 && (
            <div className="space-y-3">
              {activeTab === 'all' && (
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Reddit Posts
                  <span className="font-normal text-gray-400 ml-2 normal-case">
                    {searchMeta?.subredditsSearched.map((s) => `r/${s}`).join(', ')}
                  </span>
                </h3>
              )}
              {redditResults.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-orange-100 text-orange-700 text-xs shrink-0">
                            r/{post.subreddit}
                          </Badge>
                          {post.link_flair_text && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {post.link_flair_text}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(post.created_utc)}
                          </span>
                        </div>

                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-medium text-gray-900 hover:text-orange-600 line-clamp-2"
                        >
                          {post.title}
                        </a>

                        {post.selftext && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {post.selftext}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {post.score}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {post.num_comments} comments
                          </span>
                          <span>by u/{post.author}</span>
                        </div>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline" className="h-8 px-2">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </a>
                        {post.url !== post.permalink && !post.url.includes('reddit.com') && (
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline" className="h-8 px-2">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state - no search yet */}
          {!searching && redditResults.length === 0 && craigslistResults.length === 0 && !searchMeta && (
            <Card>
              <CardContent className="text-center py-12">
                <Radar className="h-12 w-12 text-orange-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Search Equipment Across Platforms
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Search Craigslist heavy equipment listings and Reddit communities
                  simultaneously to find vendors, deals, and dealer recommendations.
                </p>
              </CardContent>
            </Card>
          )}

          {/* No results state */}
          {!searching && searchMeta && totalResults === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">
                  No results found. Try broadening your search terms or selecting a different equipment type.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Platform status cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  Craigslist
                  <Badge className="bg-green-100 text-green-700 text-xs">Live</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-500">
                Heavy equipment listings across all US regions.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  Reddit
                  <Badge className="bg-green-100 text-green-700 text-xs">Live</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-500">
                r/heavyequipment, r/construction, and related communities.
              </CardContent>
            </Card>

            <Card className="opacity-60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  Marketplace Monitoring
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-500">
                Get alerts when new listings match your criteria.
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
