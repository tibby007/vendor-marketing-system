import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Search, Calendar, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get lead stats
  const { data: leads } = await supabase
    .from('leads')
    .select('status')
    .eq('user_id', user.id)

  const stats = {
    totalLeads: leads?.length || 0,
    newLeads: leads?.filter((l) => l.status === 'new').length || 0,
    converted: leads?.filter((l) => l.status === 'converted').length || 0,
    followUps: leads?.filter((l) => l.status === 'follow_up').length || 0,
  }

  const searchesUsed = (profile as { searches_this_month: number } | null)?.searches_this_month || 0
  const searchLimit =
    profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'enterprise'
      ? 'Unlimited'
      : profile?.subscription_tier === 'starter'
      ? 10
      : 3

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your leads today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-gray-500">
              {stats.newLeads} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
            <p className="text-xs text-gray-500">
              {stats.totalLeads > 0
                ? `${Math.round((stats.converted / stats.totalLeads) * 100)}% conversion rate`
                : 'No leads yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.followUps}</div>
            <p className="text-xs text-gray-500">
              Pending follow-ups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Searches Used</CardTitle>
            <Search className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {searchesUsed}
              <span className="text-sm font-normal text-gray-500">
                /{searchLimit}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Find New Vendors</CardTitle>
            <CardDescription>
              Use AI to discover equipment vendors in your target area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/ai-finder">
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                <Search className="mr-2 h-4 w-4" />
                Launch AI Lead Finder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Your Leads</CardTitle>
            <CardDescription>
              View, organize, and follow up with your saved leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/my-leads">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                View My Leads
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Banner (for free/starter users) */}
      {(profile?.subscription_tier === 'free' || !profile?.subscription_tier) && (
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Upgrade to Pro</h3>
                <p className="text-orange-100">
                  Get unlimited searches, advanced features, and priority support.
                </p>
              </div>
              <Link href="/billing">
                <Button variant="secondary" className="whitespace-nowrap">
                  View Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
