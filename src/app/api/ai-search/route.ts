import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateMockVendors } from '@/lib/search/mock-data'
import { SUBSCRIPTION_TIERS } from '@/lib/constants'

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

    const adminClient = createAdminClient()

    // Get profile with current search count
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('subscription_tier, searches_this_month, searches_reset_date')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const tier = (profile.subscription_tier || 'free') as keyof typeof SUBSCRIPTION_TIERS
    const tierConfig = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free
    const searchLimit = tierConfig.searchLimit

    // Check if we need to reset monthly count
    const resetDate = profile.searches_reset_date
      ? new Date(profile.searches_reset_date)
      : null
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    let currentCount = profile.searches_this_month || 0

    if (!resetDate || resetDate < monthStart) {
      // New month — reset count
      currentCount = 0
    }

    // Enforce search limit server-side
    if (searchLimit !== -1 && currentCount >= searchLimit) {
      return NextResponse.json(
        {
          error: 'Search limit reached',
          searchCount: currentCount,
          searchLimit,
          tier,
        },
        { status: 429 }
      )
    }

    // Validate input
    const body = await request.json()
    const { state, equipmentType } = body

    if (!state) {
      return NextResponse.json(
        { error: 'State is required' },
        { status: 400 }
      )
    }

    // Generate results
    const vendors = generateMockVendors(state, equipmentType || 'any')

    // Strip contact info for free tier (server-side enforcement)
    const results = tier === 'free'
      ? vendors.map((v) => ({
          ...v,
          email: '',
          phone: '',
          website: '',
        }))
      : vendors

    // Atomically increment search count using the DB function
    const { data: newCount, error: incrementError } = await adminClient.rpc(
      'increment_search_count',
      { p_user_id: user.id }
    )

    if (incrementError) {
      console.error('Failed to increment search count:', incrementError)
      // Fallback: manual increment
      await adminClient
        .from('profiles')
        .update({
          searches_this_month: currentCount + 1,
          searches_reset_date: monthStart.toISOString(),
        })
        .eq('id', user.id)
    }

    // Record search in history
    await adminClient.from('search_history').insert({
      user_id: user.id,
      search_type: 'ai_finder',
      criteria: { state, equipmentType },
      results_count: vendors.length,
    })

    return NextResponse.json({
      results,
      searchCount: newCount || currentCount + 1,
      searchLimit,
      tier,
    })
  } catch (error) {
    console.error('AI search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
