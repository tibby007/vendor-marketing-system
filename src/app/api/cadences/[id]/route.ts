import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const adminClient = createAdminClient()
    const body = await request.json()
    const { status, stop_reason } = body as {
      status: 'stopped' | 'paused'
      stop_reason?: string
    }

    if (!status || !['stopped', 'paused'].includes(status)) {
      return NextResponse.json(
        { error: 'status must be "stopped" or "paused"' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: cadence, error: fetchError } = await adminClient
      .from('cadences')
      .select('id, user_id, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !cadence) {
      return NextResponse.json({ error: 'Cadence not found' }, { status: 404 })
    }

    if (cadence.status !== 'active' && cadence.status !== 'paused') {
      return NextResponse.json(
        { error: 'Can only stop/pause an active or paused cadence' },
        { status: 400 }
      )
    }

    // Update cadence status
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (status === 'stopped') {
      updateData.stopped_at = new Date().toISOString()
      if (stop_reason) {
        updateData.stop_reason = stop_reason
      }
    }

    const { data: updatedCadence, error: updateError } = await adminClient
      .from('cadences')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Cadence update error:', updateError)
      return NextResponse.json({ error: 'Failed to update cadence' }, { status: 500 })
    }

    // Cancel all pending steps
    const { error: stepsError } = await adminClient
      .from('cadence_steps')
      .update({ status: 'cancelled' })
      .eq('cadence_id', id)
      .eq('status', 'pending')

    if (stepsError) {
      console.error('Steps cancellation error:', stepsError)
    }

    return NextResponse.json({ cadence: updatedCadence })
  } catch (error) {
    console.error('Cadence PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update cadence' }, { status: 500 })
  }
}
