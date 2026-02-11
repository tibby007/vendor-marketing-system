import { NextRequest, NextResponse } from 'next/server'
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

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()
    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Auto-downgrade expired promo subscriptions
    if (
      profile?.promo_expires_at &&
      profile?.promo_code &&
      new Date(profile.promo_expires_at) < new Date() &&
      !profile.stripe_subscription_id // Don't downgrade paying customers
    ) {
      const { data: updatedProfile } = await adminClient
        .from('profiles')
        .update({
          subscription_tier: 'free',
          promo_code: null,
          promo_expires_at: null,
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updatedProfile) {
        return NextResponse.json({ profile: updatedProfile })
      }
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Only allow updating safe fields
    const allowedFields = ['full_name', 'company_name', 'phone']
    const updates: Record<string, string> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    const adminClient = createAdminClient()
    const { data: profile, error } = await adminClient
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
