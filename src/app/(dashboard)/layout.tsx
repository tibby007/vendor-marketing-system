import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/layout/Sidebar'

// Valid promo codes and their configurations
const PROMO_CODES: Record<string, { tier: string; durationMonths: number }> = {
  COHORT2026: { tier: 'pro', durationMonths: 6 },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile using admin client to bypass RLS
  const adminClient = createAdminClient()
  let { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check for unactivated promo code in user metadata
  const metadata = user.user_metadata || {}
  const metaPromoCode = metadata.promo_code?.toUpperCase()?.trim()

  if (
    metaPromoCode &&
    PROMO_CODES[metaPromoCode] &&
    profile &&
    !profile.promo_code &&
    profile.subscription_tier === 'free'
  ) {
    const promo = PROMO_CODES[metaPromoCode]
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + promo.durationMonths)

    const { data: activatedProfile } = await adminClient
      .from('profiles')
      .update({
        subscription_tier: promo.tier,
        promo_code: metaPromoCode,
        promo_expires_at: expiresAt.toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (activatedProfile) {
      profile = activatedProfile
    }
  }

  const userData = {
    email: user.email || '',
    full_name: profile?.full_name,
    company_name: profile?.company_name,
    subscription_tier: profile?.subscription_tier || 'free',
    is_admin: profile?.is_admin || false,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={userData} />

      {/* Main content */}
      <main className="lg:pl-64">
        {/* Add top padding on mobile for the fixed header */}
        <div className="pt-16 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
