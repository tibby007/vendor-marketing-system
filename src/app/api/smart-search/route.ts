import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { searchReddit } from '@/lib/reddit/client'
import { searchCraigslist } from '@/lib/craigslist/client'
import { EQUIPMENT_TYPES } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription tier - Smart Search is Pro/Enterprise only
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tier = profile?.subscription_tier || 'free'
    if (tier !== 'pro' && tier !== 'enterprise') {
      return NextResponse.json(
        { error: 'Smart Search requires a Pro or Enterprise subscription' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { query, equipmentType, state, platforms } = body

    if (!query && (!equipmentType || equipmentType === 'any') && !state) {
      return NextResponse.json(
        { error: 'Please provide a search query, equipment type, or state' },
        { status: 400 }
      )
    }

    // Determine which platforms to search
    const enabledPlatforms: string[] = platforms || ['reddit', 'craigslist']

    // Build Reddit search query
    const redditParts: string[] = []
    if (query) redditParts.push(query)
    if (equipmentType && equipmentType !== 'any') {
      const equipLabel = EQUIPMENT_TYPES.find((e) => e.value === equipmentType)?.label
      if (equipLabel) redditParts.push(equipLabel)
    }
    if (state) redditParts.push(state)
    if (!redditParts.some((p) => /equipment|dealer|vendor|sale/i.test(p))) {
      redditParts.push('dealer OR vendor OR sale')
    }
    const redditQuery = redditParts.join(' ')

    // Search both platforms in parallel
    const [redditResults, craigslistResults] = await Promise.allSettled([
      enabledPlatforms.includes('reddit')
        ? searchReddit(redditQuery, { sort: 'relevance', time: 'year', limit: 25 })
        : Promise.resolve(null),
      enabledPlatforms.includes('craigslist')
        ? searchCraigslist(query || '', { equipmentType, state: state || undefined })
        : Promise.resolve(null),
    ])

    const reddit =
      redditResults.status === 'fulfilled' && redditResults.value
        ? {
            posts: redditResults.value.posts,
            subredditsSearched: redditResults.value.subredditsSearched,
            totalResults: redditResults.value.totalResults,
          }
        : { posts: [], subredditsSearched: [], totalResults: 0, error: redditResults.status === 'rejected' ? (redditResults.reason as Error).message : undefined }

    const craigslist =
      craigslistResults.status === 'fulfilled' && craigslistResults.value
        ? {
            listings: craigslistResults.value.listings,
            totalResults: craigslistResults.value.totalResults,
            region: craigslistResults.value.region,
          }
        : { listings: [], totalResults: 0, region: '', error: craigslistResults.status === 'rejected' ? (craigslistResults.reason as Error).message : undefined }

    return NextResponse.json({
      reddit,
      craigslist,
      query: redditQuery,
    })
  } catch (error) {
    console.error('Smart search error:', error)
    const message = error instanceof Error ? error.message : 'Search failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
