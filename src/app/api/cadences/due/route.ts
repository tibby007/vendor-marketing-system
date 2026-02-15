import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const today = new Date().toISOString().split('T')[0]

    // Get pending cadence steps that are due today or earlier
    // Join with cadences (for angle + status), leads (for merge fields), and email_templates
    const { data: dueSteps, error } = await adminClient
      .from('cadence_steps')
      .select(`
        *,
        cadences!inner (
          id,
          angle,
          status,
          user_id,
          lead_id,
          leads (
            id,
            company_name,
            contact_name,
            email,
            equipment_types
          )
        ),
        email_templates (
          id,
          name,
          subject,
          body
        )
      `)
      .eq('cadences.user_id', user.id)
      .eq('cadences.status', 'active')
      .eq('status', 'pending')
      .lte('scheduled_date', today)
      .order('scheduled_date', { ascending: true })

    if (error) {
      console.error('Due steps fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch due steps' }, { status: 500 })
    }

    // Enrich each step with replaced merge fields
    const enrichedSteps = (dueSteps || []).map((step) => {
      const lead = (step.cadences as Record<string, unknown>)?.leads as {
        id: string
        company_name: string
        contact_name: string | null
        email: string | null
        equipment_types: string[] | null
      } | null
      const template = step.email_templates as {
        id: string
        name: string
        subject: string
        body: string
      } | null
      const cadence = step.cadences as {
        id: string
        angle: string
        status: string
        user_id: string
        lead_id: string
      }

      let subject = template?.subject || ''
      let body = template?.body || ''

      if (lead) {
        const equipmentType = lead.equipment_types?.[0]?.replace(/_/g, ' ') || 'equipment'
        const replaceMergeFields = (text: string) =>
          text
            .replace(/\{\{company_name\}\}/g, lead.company_name || 'your company')
            .replace(/\{\{contact_name\}\}/g, lead.contact_name || 'there')
            .replace(/\{\{equipment_type\}\}/g, equipmentType)

        subject = replaceMergeFields(subject)
        body = replaceMergeFields(body)
      }

      return {
        id: step.id,
        cadence_id: step.cadence_id,
        step_number: step.step_number,
        scheduled_date: step.scheduled_date,
        status: step.status,
        template_id: step.template_id,
        angle: cadence?.angle || null,
        lead_id: cadence?.lead_id || null,
        lead: lead
          ? {
              id: lead.id,
              company_name: lead.company_name,
              contact_name: lead.contact_name,
              email: lead.email,
            }
          : null,
        subject,
        body,
      }
    })

    return NextResponse.json({ steps: enrichedSteps })
  } catch (error) {
    console.error('Due steps GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch due steps' }, { status: 500 })
  }
}
