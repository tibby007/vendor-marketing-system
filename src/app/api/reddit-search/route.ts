import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { searchReddit } from '@/lib/reddit/client'
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
    const { query, equipmentType, state } = body

    if (!query && !equipmentType && !state) {
      return NextResponse.json(
        { error: 'Please provide a search query, equipment type, or state' },
        { status: 400 }
      )
    }

    // Build search query from inputs
    const searchParts: string[] = []

    if (query) {
      searchParts.push(query)
    }

    if (equipmentType && equipmentType !== 'any') {
      const equipLabel = EQUIPMENT_TYPES.find((e) => e.value === equipmentType)?.label
      if (equipLabel) {
        searchParts.push(equipLabel)
      }
    }

    if (state) {
      searchParts.push(state)
    }

    // Add equipment context if not already present
    if (!searchParts.some((p) => /equipment|dealer|vendor|sale/i.test(p))) {
      searchParts.push('dealer OR vendor OR sale')
    }

    const searchQuery = searchParts.join(' ')

    const results = await searchReddit(searchQuery, {
      sort: 'relevance',
      time: 'year',
      limit: 25,
    })

    return NextResponse.json({
      results: results.posts,
      subredditsSearched: results.subredditsSearched,
      totalResults: results.totalResults,
      query: searchQuery,
    })
  } catch (error) {
    console.error('Reddit search error:', error)
    const message = error instanceof Error ? error.message : 'Search failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
