'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { US_STATES, EQUIPMENT_TYPES, SUBSCRIPTION_TIERS } from '@/lib/constants'
import { MockVendor } from '@/lib/search/mock-data'
import { useToast } from '@/hooks/use-toast'
import {
  Search,
  Loader2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Plus,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Lock,
} from 'lucide-react'
import Link from 'next/link'

export default function AIFinderPage() {
  const { toast } = useToast()
  const [state, setState] = useState('')
  const [equipmentType, setEquipmentType] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<MockVendor[]>([])
  const [searchCount, setSearchCount] = useState(0)
  const [searchLimit, setSearchLimit] = useState(3)
  const [tier, setTier] = useState('free')
  const [addingLeadId, setAddingLeadId] = useState<string | null>(null)

  // Fetch user's subscription info via API to bypass RLS
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const { profile } = await response.json()
          if (profile) {
            const userTier = profile.subscription_tier || 'free'
            setTier(userTier)
            setSearchCount(profile.searches_this_month || 0)

            const tierConfig = SUBSCRIPTION_TIERS[userTier as keyof typeof SUBSCRIPTION_TIERS]
            setSearchLimit(tierConfig?.searchLimit || 3)
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }

    fetchUserInfo()
  }, [])

  const handleSearch = async () => {
    if (!state) {
      toast({
        title: 'Select a state',
        description: 'Please choose a state to search in.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setResults([])

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, equipmentType }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: 'Search limit reached',
            description: 'Upgrade your plan for more searches.',
            variant: 'destructive',
          })
          setSearchCount(data.searchCount || searchCount)
          return
        }
        throw new Error(data.error || 'Search failed')
      }

      setResults(data.results)
      setSearchCount(data.searchCount)
      setSearchLimit(data.searchLimit)
      setTier(data.tier)

      toast({
        title: 'Search complete',
        description: `Found ${data.results.length} potential vendors.`,
      })
    } catch {
      toast({
        title: 'Search failed',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddLead = async (vendor: MockVendor) => {
    setAddingLeadId(vendor.id)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: vendor.company_name,
          contact_name: vendor.contact_name,
          email: vendor.email,
          phone: vendor.phone,
          website: vendor.website,
          address: vendor.address,
          city: vendor.city,
          state: vendor.state,
          zip_code: vendor.zip_code,
          equipment_types: vendor.equipment_types,
          source: 'ai_finder',
          status: 'new',
          notes: vendor.description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: 'Lead limit reached',
            description: data.error || 'Upgrade your plan to save more leads.',
            variant: 'destructive',
          })
          return
        }
        throw new Error(data.error || 'Failed to add lead')
      }

      toast({
        title: 'Lead added',
        description: `${vendor.company_name} has been added to your leads.`,
      })

      // Remove from results
      setResults((prev) => prev.filter((v) => v.id !== vendor.id))
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add lead. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setAddingLeadId(null)
    }
  }

  const handleEmail = (vendor: MockVendor) => {
    const subject = encodeURIComponent(
      `Partnership Opportunity - Equipment Financing for ${vendor.company_name}`
    )
    const body = encodeURIComponent(
      `Hi ${vendor.contact_name},\n\nI came across ${vendor.company_name} and noticed you sell quality ${vendor.equipment_types[0]?.replace('_', ' ')} in the ${vendor.city} area. I work with equipment dealers to help their customers secure competitive financing options.\n\nWould you be open to a quick call to discuss how a financing partnership could help you close more sales?\n\nBest regards`
    )
    window.location.href = `mailto:${vendor.email}?subject=${subject}&body=${body}`
  }

  const remainingSearches = searchLimit === -1 ? 'Unlimited' : searchLimit - searchCount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Lead Finder</h1>
        <p className="text-gray-500">
          Use AI to discover equipment vendors in your target market.
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            Search Criteria
          </CardTitle>
          <CardDescription>
            Select your target location and equipment type to find vendors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">State *</label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Equipment Type</label>
              <Select value={equipmentType} onValueChange={setEquipmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Any equipment" />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_TYPES.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={handleSearch}
                disabled={loading || (searchLimit !== -1 && searchCount >= searchLimit)}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Vendors
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Search count indicator */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Searches remaining: <strong>{remainingSearches}</strong>
            </span>
            {tier === 'free' && (
              <Link href="/billing" className="text-orange-600 hover:underline">
                Upgrade for more searches
              </Link>
            )}
          </div>

          {/* Limit reached warning */}
          {searchLimit !== -1 && searchCount >= searchLimit && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800">Search limit reached</p>
                <p className="text-sm text-orange-700">
                  You&apos;ve used all your searches for this month.{' '}
                  <Link href="/billing" className="underline">
                    Upgrade your plan
                  </Link>{' '}
                  to continue searching.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Found {results.length} Vendors
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {results.map((vendor) => (
              <Card key={vendor.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{vendor.company_name}</h3>
                      <p className="text-sm text-gray-500">{vendor.contact_name}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {vendor.relevance_score}% match
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {vendor.city}, {vendor.state} {vendor.zip_code}
                    </div>
                    {tier === 'free' ? (
                      <>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Phone className="h-4 w-4" />
                          <span className="blur-sm select-none">(555) 123-4567</span>
                          <Link href="/billing">
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer ml-1">
                              <Lock className="h-3 w-3 mr-1" />
                              Upgrade
                            </Badge>
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Mail className="h-4 w-4" />
                          <span className="blur-sm select-none">contact@company.com</span>
                          <Link href="/billing">
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer ml-1">
                              <Lock className="h-3 w-3 mr-1" />
                              Upgrade
                            </Badge>
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Globe className="h-4 w-4" />
                          <span className="blur-sm select-none">www.company.com</span>
                          <Link href="/billing">
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer ml-1">
                              <Lock className="h-3 w-3 mr-1" />
                              Upgrade
                            </Badge>
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          {vendor.phone}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          {vendor.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Globe className="h-4 w-4" />
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {vendor.website.replace('https://www.', '')}
                            <ExternalLink className="inline h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {vendor.equipment_types.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {EQUIPMENT_TYPES.find((e) => e.value === type)?.label || type}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{vendor.description}</p>

                  <div className="flex gap-2">
                    {tier === 'free' ? (
                      <Link href="/billing" className="flex-1">
                        <Button
                          size="sm"
                          className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                          <Lock className="h-4 w-4 mr-1" />
                          Upgrade to Access
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 bg-orange-500 hover:bg-orange-600"
                          onClick={() => handleAddLead(vendor)}
                          disabled={addingLeadId === vendor.id}
                        >
                          {addingLeadId === vendor.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Add to Leads
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEmail(vendor)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && state && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No results yet
            </h3>
            <p className="text-gray-500">
              Click &quot;Find Vendors&quot; to search for equipment dealers in your selected area.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
