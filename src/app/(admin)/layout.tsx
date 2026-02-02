import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, ArrowLeft } from 'lucide-react'

export default async function AdminLayout({
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

  // Check if user is admin using admin client to bypass RLS
  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to App</span>
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-gray-800 text-white">
        <div className="container">
          <div className="flex gap-1">
            <Link href="/admin">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700 rounded-none border-b-2 border-transparent data-[active=true]:border-orange-500">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Overview
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700 rounded-none border-b-2 border-transparent">
                <Users className="h-4 w-4 mr-2" />
                Users
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container py-8">{children}</main>
    </div>
  )
}
