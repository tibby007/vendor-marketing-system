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
  Plus,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { EQUIPMENT_TYPES, US_STATES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

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
  const { toast } = useToast()
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
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null)
  const [savedLeadIds, setSavedLeadIds] = useState<Set<string>>(new Set())

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
    setSavedLeadIds(new Set())

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

  const handleSaveCraigslistLead = async (listing: CraigslistListing, index: number) => {
    const leadId = `cl-${index}`
    setSavingLeadId(leadId)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Extract equipment type from search context
      const equipTypes = equipmentType !== 'any' ? [equipmentType] : []

      const { error: insertError } = await supabase.from('leads').insert({
        user_id: user.id,
        company_name: listing.title,
        city: listing.location || undefined,
        state: state && state !== 'any' ? state : undefined,
        equipment_types: equipTypes.length > 0 ? equipTypes : undefined,
        source: 'smart_search' as const,
        source_url: listing.url,
        status: 'new' as const,
        notes: `Craigslist listing - ${listing.price || 'Price not listed'}. Found via Smart Search.`,
      })

      if (insertError) throw insertError

      setSavedLeadIds((prev) => new Set(prev).add(leadId))
      toast({
        title: 'Lead saved',
        description: 'Listing saved to My Leads. Visit the listing to get contact details.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save lead. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSavingLeadId(null)
    }
  }

  const handleSaveRedditLead = async (post: RedditPost) => {
    const leadId = `rd-${post.id}`
    setSavingLeadId(leadId)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const equipTypes = equipmentType !== 'any' ? [equipmentType] : []

      const { error: insertError } = await supabase.from('leads').insert({
        user_id: user.id,
        company_name: post.title.slice(0, 100),
        contact_name: `u/${post.author}`,
        equipment_types: equipTypes.length > 0 ? equipTypes : undefined,
        source: 'smart_search' as const,
        source_url: post.permalink,
        status: 'new' as const,
        notes: `Reddit post from r/${post.subreddit} (${post.score} upvotes, ${post.num_comments} comments). ${post.selftext ? post.selftext.slice(0, 200) : ''}`.trim(),
      })

      if (insertError) throw insertError

      setSavedLeadIds((prev) => new Set(prev).add(leadId))
      toast({
        title: 'Lead saved',
        description: 'Reddit post saved to My Leads.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save lead. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSavingLeadId(null)
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
          {/* How to Use Guide - shown before first search */}
          {!searchMeta && redditResults.length === 0 && craigslistResults.length === 0 && !searching && (
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

                  <div className="mt-4">
                    <Button
                      onClick={handleSearch}
                      disabled={searching}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search All Platforms
                    </Button>
                  </div>

                  {error && (
                    <p className="mt-3 text-sm text-red-600">{error}</p>
                  )}
                </CardContent>
              </Card>

              {/* How It Works */}
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-orange-500" />
                    How Smart Search Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
                        <h4 className="font-semibold text-gray-900">Search across platforms</h4>
                      </div>
                      <p className="text-sm text-gray-600 pl-9">
                        Enter an equipment type, keyword, or state. We search Craigslist heavy equipment listings and Reddit communities simultaneously.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
                        <h4 className="font-semibold text-gray-900">Save leads you want to pursue</h4>
                      </div>
                      <p className="text-sm text-gray-600 pl-9">
                        Click &quot;Save Lead&quot; on any result to add it to your My Leads pipeline. The listing URL and details are saved automatically.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
                        <h4 className="font-semibold text-gray-900">Follow up and convert</h4>
                      </div>
                      <p className="text-sm text-gray-600 pl-9">
                        Go to My Leads to track status, add contact info from the listing, set follow-up dates, and send outreach emails.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-orange-200">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Tips for best results:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>&#8226; Select a <strong>state</strong> for Craigslist — it targets that region&apos;s listings directly</li>
                      <li>&#8226; Use specific terms like &quot;Cat 320&quot; or &quot;John Deere dealer&quot; for more relevant results</li>
                      <li>&#8226; Craigslist returns priced listings; Reddit surfaces discussions, recommendations, and dealer reviews</li>
                      <li>&#8226; Saved leads appear in <strong>My Leads</strong> with a &quot;Smart Search&quot; source tag so you can filter them</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

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

          {/* Search Form (when results are shown) */}
          {(searchMeta || searching) && (
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
                        setSavedLeadIds(new Set())
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
          )}

          {/* Results Tabs & Summary */}
          {searchMeta && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    Found <strong className="text-gray-900">{totalResults}</strong> results across platforms
                  </span>
                  {savedLeadIds.size > 0 && (
                    <Link href="/my-leads" className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium">
                      {savedLeadIds.size} saved <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
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
              {craigslistResults.map((listing, i) => {
                const leadId = `cl-${i}`
                const isSaved = savedLeadIds.has(leadId)
                const isSaving = savingLeadId === leadId

                return (
                  <Card key={leadId} className={`hover:shadow-md transition-shadow ${isSaved ? 'border-green-200 bg-green-50/30' : ''}`}>
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
                            {isSaved && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Saved
                              </Badge>
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

                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant={isSaved ? 'outline' : 'default'}
                            className={`h-8 ${!isSaved ? 'bg-orange-500 hover:bg-orange-600' : 'text-green-700 border-green-300'}`}
                            disabled={isSaving || isSaved}
                            onClick={() => handleSaveCraigslistLead(listing, i)}
                          >
                            {isSaving ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isSaved ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Saved
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Save Lead
                              </>
                            )}
                          </Button>
                          <a
                            href={listing.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline" className="h-8 px-2">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
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
              {redditResults.map((post) => {
                const leadId = `rd-${post.id}`
                const isSaved = savedLeadIds.has(leadId)
                const isSaving = savingLeadId === leadId

                return (
                  <Card key={post.id} className={`hover:shadow-md transition-shadow ${isSaved ? 'border-green-200 bg-green-50/30' : ''}`}>
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
                            {isSaved && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Saved
                              </Badge>
                            )}
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
                          <Button
                            size="sm"
                            variant={isSaved ? 'outline' : 'default'}
                            className={`h-8 ${!isSaved ? 'bg-orange-500 hover:bg-orange-600' : 'text-green-700 border-green-300'}`}
                            disabled={isSaving || isSaved}
                            onClick={() => handleSaveRedditLead(post)}
                          >
                            {isSaving ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isSaved ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Saved
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Save Lead
                              </>
                            )}
                          </Button>
                          <a
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline" className="h-8 px-2">
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Saved leads CTA */}
          {savedLeadIds.size > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {savedLeadIds.size} lead{savedLeadIds.size !== 1 ? 's' : ''} saved to your pipeline
                      </p>
                      <p className="text-sm text-gray-500">
                        Visit each listing to grab contact details, then manage follow-ups in My Leads.
                      </p>
                    </div>
                  </div>
                  <Link href="/my-leads">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Go to My Leads
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
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
        </>
      )}
    </div>
  )
}
