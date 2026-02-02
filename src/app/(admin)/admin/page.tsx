import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, TrendingUp, Search, UserPlus } from 'lucide-react'
import { SUBSCRIPTION_TIERS } from '@/lib/constants'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get all profiles with their stats
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Get total leads count
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })

  // Get total searches count
  const { count: totalSearches } = await supabase
    .from('search_history')
    .select('*', { count: 'exact', head: true })

  // Calculate stats
  const totalUsers = profiles?.length || 0
  const freeUsers = profiles?.filter(p => !p.subscription_tier || p.subscription_tier === 'free').length || 0
  const starterUsers = profiles?.filter(p => p.subscription_tier === 'starter').length || 0
  const proUsers = profiles?.filter(p => p.subscription_tier === 'pro').length || 0
  const enterpriseUsers = profiles?.filter(p => p.subscription_tier === 'enterprise').length || 0

  // Calculate MRR (Monthly Recurring Revenue)
  const mrr = (starterUsers * SUBSCRIPTION_TIERS.starter.price) + (proUsers * SUBSCRIPTION_TIERS.pro.price)

  // Recent signups (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentSignups = profiles?.filter(p => new Date(p.created_at) > sevenDaysAgo).length || 0

  // Recent signups list (last 5)
  const recentUsers = profiles?.slice(0, 5) || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 mt-1">Monitor your platform metrics and user activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-gray-500">
              +{recentSignups} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${mrr.toLocaleString()}</div>
            <p className="text-xs text-gray-500">
              Monthly recurring revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500">
              Across all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSearches?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500">
              AI searches performed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Breakdown</CardTitle>
            <CardDescription>Users by subscription tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm">Free</span>
                </div>
                <span className="font-medium">{freeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Starter ($29/mo)</span>
                </div>
                <span className="font-medium">{starterUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm">Pro ($69/mo)</span>
                </div>
                <span className="font-medium">{proUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm">Enterprise</span>
                </div>
                <span className="font-medium">{enterpriseUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>Latest users to join the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <p className="text-sm text-gray-500">No users yet</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <UserPlus className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
