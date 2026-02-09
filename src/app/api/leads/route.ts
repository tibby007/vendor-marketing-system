import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

    // Get profile for tier check
    const { data: profile } = await adminClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tier = (profile?.subscription_tier || 'free') as keyof typeof SUBSCRIPTION_TIERS
    const tierConfig = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free
    const leadLimit = tierConfig.leadLimit

    // Check lead count if there's a limit
    if (leadLimit !== -1) {
      const { count, error: countError } = await adminClient
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (countError) {
        return NextResponse.json({ error: 'Failed to check lead count' }, { status: 500 })
      }

      if ((count || 0) >= leadLimit) {
        return NextResponse.json(
          {
            error: `Lead limit reached. Your ${tierConfig.name} plan allows ${leadLimit} leads. Upgrade for more.`,
            leadCount: count,
            leadLimit,
          },
          { status: 429 }
        )
      }
    }

    // Validate and insert lead
    const body = await request.json()

    if (!body.company_name?.trim()) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    const { data: lead, error: insertError } = await adminClient
      .from('leads')
      .insert({
        user_id: user.id,
        company_name: body.company_name,
        contact_name: body.contact_name || null,
        email: body.email || null,
        phone: body.phone || null,
        website: body.website || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        zip_code: body.zip_code || null,
        equipment_types: body.equipment_types || null,
        source: body.source || 'manual',
        source_url: body.source_url || null,
        status: body.status || 'new',
        notes: body.notes || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Lead insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Lead creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
