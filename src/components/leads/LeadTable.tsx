'use client'

import { useState } from 'react'
import { Lead } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Mail, Edit, Trash2, Eye } from 'lucide-react'
import { LEAD_STATUSES } from '@/lib/constants'
import { formatDistanceToNow } from 'date-fns'
import { EditLeadDialog } from './EditLeadDialog'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface LeadTableProps {
  leads: Lead[]
  onUpdate: () => void
}

export function LeadTable({ leads, onUpdate }: LeadTableProps) {
  const { toast } = useToast()
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    const statusConfig = LEAD_STATUSES.find((s) => s.value === status)
    return (
      <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-800'}>
        {statusConfig?.label || status}
      </Badge>
    )
  }

  const handleEmail = (lead: Lead) => {
    const subject = encodeURIComponent(
      `Partnership Opportunity - Equipment Financing for ${lead.company_name}`
    )
    const body = encodeURIComponent(
      `Hi ${lead.contact_name || 'there'},\n\nI came across ${lead.company_name} and noticed you sell quality equipment in the area. I work with equipment dealers to help their customers secure competitive financing options.\n\nWould you be open to a quick call to discuss how a financing partnership could help you close more sales?\n\nBest regards`
    )
    window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return

    setDeletingId(id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('leads').delete().eq('id', id)

      if (error) throw error

      toast({
        title: 'Lead deleted',
        description: 'The lead has been removed from your list.',
      })
      onUpdate()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete lead. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('leads')
        .update({
          status: newStatus,
          last_contacted: newStatus === 'contacted' ? new Date().toISOString() : lead.last_contacted,
        })
        .eq('id', lead.id)

      if (error) throw error

      toast({
        title: 'Status updated',
        description: `Lead status changed to ${newStatus.replace('_', ' ')}.`,
      })
      onUpdate()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Eye className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
        <p className="text-gray-500 mb-4">
          Start tracking vendors you&apos;ve contacted by adding your first lead.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">
                  <div>
                    <p>{lead.company_name}</p>
                    {lead.website && (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {lead.website.replace(/^https?:\/\//, '').slice(0, 30)}
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{lead.contact_name || '-'}</p>
                    {lead.email && (
                      <p className="text-xs text-gray-500">{lead.email}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {lead.city && lead.state
                    ? `${lead.city}, ${lead.state}`
                    : lead.state || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {lead.equipment_types?.slice(0, 2).map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    )) || '-'}
                    {(lead.equipment_types?.length || 0) > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{lead.equipment_types!.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(lead.status)}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(lead.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === lead.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {lead.email && (
                        <DropdownMenuItem onClick={() => handleEmail(lead)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => setEditingLead(lead)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-gray-500"
                        disabled={lead.status === 'new'}
                        onClick={() => handleStatusChange(lead, 'new')}
                      >
                        Mark as New
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-yellow-600"
                        disabled={lead.status === 'contacted'}
                        onClick={() => handleStatusChange(lead, 'contacted')}
                      >
                        Mark as Contacted
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-orange-600"
                        disabled={lead.status === 'follow_up'}
                        onClick={() => handleStatusChange(lead, 'follow_up')}
                      >
                        Mark as Follow Up
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-green-600"
                        disabled={lead.status === 'converted'}
                        onClick={() => handleStatusChange(lead, 'converted')}
                      >
                        Mark as Converted
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(lead.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingLead && (
        <EditLeadDialog
          lead={editingLead}
          open={!!editingLead}
          onClose={() => setEditingLead(null)}
          onSave={() => {
            setEditingLead(null)
            onUpdate()
          }}
        />
      )}
    </>
  )
}
