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
        cadences!inner ( id, user_id, lead_id )
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

    // Mark step as skipped
    const { error: updateError } = await adminClient
      .from('cadence_steps')
      .update({ status: 'skipped' })
      .eq('id', step_id)

    if (updateError) {
      console.error('Step skip error:', updateError)
      return NextResponse.json({ error: 'Failed to skip step' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Skip step error:', error)
    return NextResponse.json({ error: 'Failed to skip step' }, { status: 500 })
  }
}
