import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

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

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userData = {
    email: user.email || '',
    full_name: profile?.full_name,
    company_name: profile?.company_name,
    subscription_tier: profile?.subscription_tier || 'free',
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
