'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lead } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LeadTable } from '@/components/leads/LeadTable'
import { AddLeadDialog } from '@/components/leads/AddLeadDialog'
import { LEAD_STATUSES } from '@/lib/constants'
import {
  Users,
  TrendingUp,
  Calendar,
  AlertCircle,
  Plus,
  Download,
  Search,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function MyLeadsPage() {
  const { toast } = useToast()
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [exporting, setExporting] = useState(false)

  const fetchLeads = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load leads.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Filter leads based on search and status
  useEffect(() => {
    let filtered = leads

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (lead) =>
          lead.company_name.toLowerCase().includes(query) ||
          lead.contact_name?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.city?.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.status === statusFilter)
    }

    setFilteredLeads(filtered)
  }, [leads, searchQuery, statusFilter])

  const stats = {
    total: leads.length,
    converted: leads.filter((l) => l.status === 'converted').length,
    followUps: leads.filter((l) => l.status === 'follow_up').length,
    overdue: leads.filter((l) => {
      if (!l.follow_up_date) return false
      return new Date(l.follow_up_date) < new Date()
    }).length,
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      // Create CSV content
      const headers = [
        'Company Name',
        'Contact Name',
        'Email',
        'Phone',
        'Website',
        'Address',
        'City',
        'State',
        'ZIP',
        'Equipment Types',
        'Status',
        'Source',
        'Notes',
        'Created At',
      ]

      const rows = leads.map((lead) => [
        lead.company_name,
        lead.contact_name || '',
        lead.email || '',
        lead.phone || '',
        lead.website || '',
        lead.address || '',
        lead.city || '',
        lead.state || '',
        lead.zip_code || '',
        lead.equipment_types?.join(', ') || '',
        lead.status,
        lead.source,
        lead.notes || '',
        new Date(lead.created_at).toLocaleDateString(),
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()

      toast({
        title: 'Export complete',
        description: `Exported ${leads.length} leads to CSV.`,
      })
    } catch {
      toast({
        title: 'Export failed',
        description: 'Failed to export leads.',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
          <p className="text-gray-500">
            Manage and track your vendor connections.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting || leads.length === 0}
          >
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.converted}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups Today</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.followUps}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by company, contact, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {LEAD_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <LeadTable leads={filteredLeads} onUpdate={fetchLeads} />
      )}

      {/* Add Lead Dialog */}
      <AddLeadDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSave={() => {
          setShowAddDialog(false)
          fetchLeads()
        }}
      />
    </div>
  )
}
