import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CadenceAngle } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = adminClient
      .from('cadences')
      .select(`
        *,
        leads ( id, company_name, contact_name, email, equipment_types, status ),
        cadence_steps ( * )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Cadences fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch cadences' }, { status: 500 })
    }

    return NextResponse.json({ cadences: data || [] })
  } catch (error) {
    console.error('Cadences GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch cadences' }, { status: 500 })
  }
}

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
    const { lead_id, angle } = body as { lead_id: string; angle: CadenceAngle }

    if (!lead_id || !angle) {
      return NextResponse.json(
        { error: 'lead_id and angle are required' },
        { status: 400 }
      )
    }

    if (!['A', 'B', 'C'].includes(angle)) {
      return NextResponse.json(
        { error: 'angle must be A, B, or C' },
        { status: 400 }
      )
    }

    // Verify user owns the lead
    const { data: lead, error: leadError } = await adminClient
      .from('leads')
      .select('id, user_id, email, angle_used')
      .eq('id', lead_id)
      .eq('user_id', user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found or not owned by you' }, { status: 404 })
    }

    // Verify pro tier
    const { data: profile } = await adminClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tier = profile?.subscription_tier || 'free'
    if (tier !== 'pro' && tier !== 'enterprise') {
      return NextResponse.json(
        { error: 'Cadence enrollment requires a Pro or Enterprise subscription.' },
        { status: 403 }
      )
    }

    // Check no active cadence exists on this lead
    const { data: existingCadence } = await adminClient
      .from('cadences')
      .select('id')
      .eq('lead_id', lead_id)
      .eq('status', 'active')
      .maybeSingle()

    if (existingCadence) {
      return NextResponse.json(
        { error: 'This lead already has an active cadence. Stop it first before starting a new one.' },
        { status: 409 }
      )
    }

    // Create cadence row
    const { data: cadence, error: cadenceError } = await adminClient
      .from('cadences')
      .insert({
        lead_id,
        user_id: user.id,
        angle,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (cadenceError || !cadence) {
      console.error('Cadence insert error:', cadenceError)
      return NextResponse.json({ error: 'Failed to create cadence' }, { status: 500 })
    }

    // Look up cadence templates for this angle
    const { data: templates, error: templatesError } = await adminClient
      .from('email_templates')
      .select('id, cadence_step')
      .eq('angle', angle)
      .eq('category', 'cadence')
      .order('cadence_step', { ascending: true })

    if (templatesError) {
      console.error('Template lookup error:', templatesError)
    }

    // Create 4 cadence steps
    // Step 1 = today, step 2 = today+2, step 3 = today+6, step 4 = today+13
    const stepOffsets = [0, 2, 6, 13] // days from today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const stepsToInsert = [1, 2, 3, 4].map((stepNumber, idx) => {
      const scheduledDate = new Date(today)
      scheduledDate.setDate(scheduledDate.getDate() + stepOffsets[idx])

      // Find matching template for this step
      const matchingTemplate = templates?.find((t) => t.cadence_step === stepNumber)

      return {
        cadence_id: cadence.id,
        step_number: stepNumber,
        template_id: matchingTemplate?.id || null,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        status: 'pending' as const,
      }
    })

    const { data: steps, error: stepsError } = await adminClient
      .from('cadence_steps')
      .insert(stepsToInsert)
      .select()

    if (stepsError) {
      console.error('Steps insert error:', stepsError)
      return NextResponse.json({ error: 'Failed to create cadence steps' }, { status: 500 })
    }

    // Update lead.angle_used
    await adminClient
      .from('leads')
      .update({ angle_used: angle })
      .eq('id', lead_id)

    return NextResponse.json({
      cadence: { ...cadence, cadence_steps: steps },
    })
  } catch (error) {
    console.error('Cadence creation error:', error)
    return NextResponse.json({ error: 'Failed to create cadence' }, { status: 500 })
  }
}
