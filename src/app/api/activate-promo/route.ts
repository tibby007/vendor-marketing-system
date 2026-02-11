import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Valid promo codes and their configurations
const PROMO_CODES: Record<string, { tier: string; durationMonths: number }> = {
  COHORT2026: { tier: 'pro', durationMonths: 6 },
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

    const { promoCode } = await request.json()

    if (!promoCode) {
      return NextResponse.json({ error: 'Promo code required' }, { status: 400 })
    }

    // Validate promo code (case-insensitive)
    const code = promoCode.toUpperCase().trim()
    const promo = PROMO_CODES[code]

    if (!promo) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Check if user already has an active promo
    const { data: profile } = await adminClient
      .from('profiles')
      .select('promo_code, promo_expires_at, subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.promo_expires_at) {
      const expiresAt = new Date(profile.promo_expires_at)
      if (expiresAt > new Date()) {
        return NextResponse.json(
          { error: 'You already have an active promo' },
          { status: 409 }
        )
      }
    }

    // Calculate expiry date
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + promo.durationMonths)

    // Activate promo
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({
        subscription_tier: promo.tier,
        promo_code: code,
        promo_expires_at: expiresAt.toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Promo activation error:', updateError)
      return NextResponse.json({ error: 'Failed to activate promo' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Promo activated',
      tier: promo.tier,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Promo error:', error)
    return NextResponse.json({ error: 'Failed to activate promo' }, { status: 500 })
  }
}
