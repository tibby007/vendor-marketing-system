import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// Valid promo codes and their configurations
const PROMO_CODES: Record<string, { tier: string; durationMonths: number }> = {
  COHORT2026: { tier: 'pro', durationMonths: 6 },
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const adminClient = createAdminClient()
        const metadata = user.user_metadata || {}

        // Update profile with company name from signup metadata
        if (metadata.company_name) {
          await adminClient
            .from('profiles')
            .update({
              company_name: metadata.company_name,
              full_name: metadata.full_name || null,
            })
            .eq('id', user.id)
        }

        // Activate promo code if present in metadata
        const promoCodeValue = metadata.promo_code?.toUpperCase()?.trim()
        if (promoCodeValue && PROMO_CODES[promoCodeValue]) {
          const promo = PROMO_CODES[promoCodeValue]

          // Check if user already has an active promo
          const { data: profile } = await adminClient
            .from('profiles')
            .select('promo_code, promo_expires_at')
            .eq('id', user.id)
            .single()

          const hasActivePromo =
            profile?.promo_expires_at &&
            new Date(profile.promo_expires_at) > new Date()

          if (!hasActivePromo) {
            const expiresAt = new Date()
            expiresAt.setMonth(expiresAt.getMonth() + promo.durationMonths)

            await adminClient
              .from('profiles')
              .update({
                subscription_tier: promo.tier,
                promo_code: promoCodeValue,
                promo_expires_at: expiresAt.toISOString(),
              })
              .eq('id', user.id)
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
