import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SCOREBOARD_DEFAULTS } from '@/lib/constants'

export async function GET() {
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

    // Fetch weekly stats from the DB function
    const { data: statsData, error: statsError } = await adminClient.rpc(
      'get_weekly_scoreboard',
      { p_user_id: user.id }
    )

    if (statsError) {
      console.error('Scoreboard stats error:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch scoreboard stats' },
        { status: 500 }
      )
    }

    // The RPC returns a single row (or array with one element)
    const stats = Array.isArray(statsData) ? statsData[0] : statsData

    // Fetch user targets
    const { data: targetsRow, error: targetsError } = await adminClient
      .from('scoreboard_targets')
      .select('weekly_leads_found, weekly_emails_sent, weekly_replies, weekly_calls_booked, weekly_deals_activated')
      .eq('user_id', user.id)
      .single()

    if (targetsError && targetsError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine — we use defaults
      console.error('Scoreboard targets error:', targetsError)
      return NextResponse.json(
        { error: 'Failed to fetch scoreboard targets' },
        { status: 500 }
      )
    }

    const targets = targetsRow || SCOREBOARD_DEFAULTS

    return NextResponse.json({
      stats: {
        leads_found: stats?.leads_found ?? 0,
        emails_sent: stats?.emails_sent ?? 0,
        replies_received: stats?.replies_received ?? 0,
        calls_booked: stats?.calls_booked ?? 0,
        deals_activated: stats?.deals_activated ?? 0,
      },
      targets,
    })
  } catch (error) {
    console.error('Scoreboard fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to load scoreboard' },
      { status: 500 }
    )
  }
}
