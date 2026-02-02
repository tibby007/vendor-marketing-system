import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const tierColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-800',
  starter: 'bg-blue-100 text-blue-800',
  pro: 'bg-orange-100 text-orange-800',
  enterprise: 'bg-purple-100 text-purple-800',
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Get all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Get lead counts per user
  const { data: leadCounts } = await supabase
    .from('leads')
    .select('user_id')

  // Count leads per user
  const leadsPerUser: Record<string, number> = {}
  leadCounts?.forEach((lead) => {
    leadsPerUser[lead.user_id] = (leadsPerUser[lead.user_id] || 0) + 1
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">View and manage all platform users.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({profiles?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Searches</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                profiles?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">{user.company_name || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={tierColors[user.subscription_tier || 'free']}>
                        {(user.subscription_tier || 'free').charAt(0).toUpperCase() + (user.subscription_tier || 'free').slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{leadsPerUser[user.id] || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">{user.searches_this_month || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge className="bg-red-100 text-red-800">Admin</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
