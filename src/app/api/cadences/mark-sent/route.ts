import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const body = await request.json()
    const { step_id } = body as { step_id: string }

    if (!step_id) {
      return NextResponse.json({ error: 'step_id is required' }, { status: 400 })
    }

    // Get the step with cadence info to verify ownership
    const { data: step, error: stepError } = await adminClient
      .from('cadence_steps')
      .select(`
        *,
        cadences!inner ( id, user_id, lead_id, angle )
      `)
      .eq('id', step_id)
      .eq('cadences.user_id', user.id)
      .single()

    if (stepError || !step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    if (step.status !== 'pending') {
      return NextResponse.json(
        { error: 'Step is not in pending status' },
        { status: 400 }
      )
    }

    const cadence = step.cadences as { id: string; user_id: string; lead_id: string; angle: string }
    const now = new Date().toISOString()

    // Mark step as sent
    const { error: updateError } = await adminClient
      .from('cadence_steps')
      .update({
        status: 'sent',
        sent_at: now,
      })
      .eq('id', step_id)

    if (updateError) {
      console.error('Step update error:', updateError)
      return NextResponse.json({ error: 'Failed to mark step as sent' }, { status: 500 })
    }

    // Insert outreach log entry
    await adminClient.from('outreach_log').insert({
      user_id: user.id,
      lead_id: cadence.lead_id,
      event_type: 'email_sent',
      cadence_step_id: step_id,
      metadata: {
        angle: cadence.angle,
        step_number: step.step_number,
      },
    })

    // Update lead.last_contacted
    await adminClient
      .from('leads')
      .update({ last_contacted: now })
      .eq('id', cadence.lead_id)

    // If this was step 4, mark cadence as completed
    if (step.step_number === 4) {
      await adminClient
        .from('cadences')
        .update({
          status: 'completed',
          updated_at: now,
        })
        .eq('id', cadence.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark sent error:', error)
    return NextResponse.json({ error: 'Failed to mark step as sent' }, { status: 500 })
  }
}
