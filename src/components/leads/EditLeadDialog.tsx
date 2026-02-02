'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lead } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { US_STATES, EQUIPMENT_TYPES, LEAD_STATUSES } from '@/lib/constants'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface EditLeadDialogProps {
  lead: Lead
  open: boolean
  onClose: () => void
  onSave: () => void
}

export function EditLeadDialog({
  lead,
  open,
  onClose,
  onSave,
}: EditLeadDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company_name: lead.company_name,
    contact_name: lead.contact_name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    website: lead.website || '',
    address: lead.address || '',
    city: lead.city || '',
    state: lead.state || '',
    zip_code: lead.zip_code || '',
    equipment_types: lead.equipment_types || [],
    status: lead.status,
    follow_up_date: lead.follow_up_date || '',
    notes: lead.notes || '',
  })

  useEffect(() => {
    setFormData({
      company_name: lead.company_name,
      contact_name: lead.contact_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      website: lead.website || '',
      address: lead.address || '',
      city: lead.city || '',
      state: lead.state || '',
      zip_code: lead.zip_code || '',
      equipment_types: lead.equipment_types || [],
      status: lead.status,
      follow_up_date: lead.follow_up_date || '',
      notes: lead.notes || '',
    })
  }, [lead])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.company_name.trim()) {
      toast({
        title: 'Error',
        description: 'Company name is required.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('leads')
        .update({
          company_name: formData.company_name,
          contact_name: formData.contact_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          website: formData.website || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zip_code || null,
          equipment_types:
            formData.equipment_types.length > 0
              ? formData.equipment_types
              : null,
          status: formData.status,
          follow_up_date: formData.follow_up_date || null,
          notes: formData.notes || null,
        })
        .eq('id', lead.id)

      if (error) throw error

      toast({
        title: 'Lead updated',
        description: 'The lead has been updated successfully.',
      })

      onSave()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update lead. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>
            Update the details for {lead.company_name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Company Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, state: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Equipment Types */}
            <div className="space-y-2">
              <Label>Equipment Types</Label>
              <Select
                value={formData.equipment_types[0] || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    equipment_types: prev.equipment_types.includes(value)
                      ? prev.equipment_types.filter((t) => t !== value)
                      : [...prev.equipment_types, value],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment types" />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_TYPES.filter((e) => e.value !== 'any').map(
                    (equipment) => (
                      <SelectItem key={equipment.value} value={equipment.value}>
                        {equipment.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {formData.equipment_types.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.equipment_types.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full cursor-pointer hover:bg-orange-200"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          equipment_types: prev.equipment_types.filter(
                            (t) => t !== type
                          ),
                        }))
                      }
                    >
                      {EQUIPMENT_TYPES.find((e) => e.value === type)?.label} ×
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Status & Follow-up */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value as typeof prev.status }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="follow_up_date">Follow-up Date</Label>
                <Input
                  id="follow_up_date"
                  name="follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
