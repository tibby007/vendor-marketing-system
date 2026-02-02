'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Search,
  Radar,
  Users,
  FileText,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Lead Finder', href: '/ai-finder', icon: Search },
  { name: 'Smart Search', href: '/smart-search', icon: Radar },
  { name: 'My Leads', href: '/my-leads', icon: Users },
  { name: 'Email Templates', href: '/templates', icon: FileText },
]

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/billing', icon: CreditCard },
]

interface SidebarProps {
  user: {
    email: string
    full_name?: string | null
    company_name?: string | null
    subscription_tier?: string
    is_admin?: boolean
  }
}

function NavLinks({ pathname, onNavigate, isAdmin }: { pathname: string; onNavigate?: () => void; isAdmin?: boolean }) {
  return (
    <>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? 'text-orange-600' : 'text-gray-400')} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-6 border-t space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? 'text-orange-600' : 'text-gray-400')} />
              {item.name}
            </Link>
          )
        })}
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-red-100 text-red-700'
                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
            )}
          >
            <Shield className={cn('h-5 w-5', pathname.startsWith('/admin') ? 'text-red-600' : 'text-red-400')} />
            Admin Dashboard
          </Link>
        )}
      </div>
    </>
  )
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const tierColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700',
    starter: 'bg-blue-100 text-blue-700',
    pro: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-orange-100 text-orange-700',
  }

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-xl font-bold text-gray-900">VendorFinder</span>
        </Link>
      </div>

      {/* Navigation */}
      <NavLinks pathname={pathname} onNavigate={onNavigate} isAdmin={user.is_admin} />

      {/* User info & Logout */}
      <div className="px-4 py-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {user.full_name?.[0] || user.email[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.full_name || user.email}
            </p>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                tierColors[user.subscription_tier || 'free']
              )}
            >
              {(user.subscription_tier || 'free').charAt(0).toUpperCase() + (user.subscription_tier || 'free').slice(1)}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign out
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sheet */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-xl font-bold text-gray-900">VendorFinder</span>
        </Link>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
