import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SCOREBOARD_DEFAULTS } from '@/lib/constants'

const ALLOWED_FIELDS = [
  'weekly_leads_found',
  'weekly_emails_sent',
  'weekly_replies',
  'weekly_calls_booked',
  'weekly_deals_activated',
] as const

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate: only allow known target fields, values must be non-negative integers
    const updates: Record<string, number> = {}
    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        const val = Number(body[field])
        if (!Number.isFinite(val) || val < 0 || !Number.isInteger(val)) {
          return NextResponse.json(
            { error: `Invalid value for ${field}: must be a non-negative integer` },
            { status: 400 }
          )
        }
        updates[field] = val
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid target fields provided' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Upsert: insert if no row exists, update if it does
    const { data: targets, error } = await adminClient
      .from('scoreboard_targets')
      .upsert(
        {
          user_id: user.id,
          ...SCOREBOARD_DEFAULTS,
          ...updates,
        },
        { onConflict: 'user_id' }
      )
      .select('weekly_leads_found, weekly_emails_sent, weekly_replies, weekly_calls_booked, weekly_deals_activated')
      .single()

    if (error) {
      console.error('Scoreboard targets upsert error:', error)
      return NextResponse.json(
        { error: 'Failed to update targets' },
        { status: 500 }
      )
    }

    return NextResponse.json({ targets })
  } catch (error) {
    console.error('Scoreboard targets error:', error)
    return NextResponse.json(
      { error: 'Failed to update targets' },
      { status: 500 }
    )
  }
}
