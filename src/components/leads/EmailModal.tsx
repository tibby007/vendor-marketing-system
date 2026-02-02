'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, ExternalLink, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: string | null
}

interface Lead {
  company_name: string
  contact_name?: string | null
  email?: string | null
  equipment_types?: string[] | null
}

interface EmailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead
}

export function EmailModal({ open, onOpenChange, lead }: EmailModalProps) {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .order('created_at')

        if (error) throw error
        setTemplates(data || [])
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load templates.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchTemplates()
    }
  }, [open, toast])

  // Replace merge fields in text
  const replaceMergeFields = (text: string): string => {
    const equipmentType = lead.equipment_types?.[0]?.replace(/_/g, ' ') || 'equipment'

    return text
      .replace(/\{\{company_name\}\}/g, lead.company_name || 'your company')
      .replace(/\{\{contact_name\}\}/g, lead.contact_name || 'there')
      .replace(/\{\{equipment_type\}\}/g, equipmentType)
  }

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find((t) => t.id === templateId)

    if (template) {
      setSubject(replaceMergeFields(template.subject))
      setBody(replaceMergeFields(template.body))
    }
  }

  // Open in email client
  const handleSendEmail = () => {
    if (!lead.email) {
      toast({
        title: 'No email address',
        description: 'This lead does not have an email address.',
        variant: 'destructive',
      })
      return
    }

    const encodedSubject = encodeURIComponent(subject)
    const encodedBody = encodeURIComponent(body)
    window.location.href = `mailto:${lead.email}?subject=${encodedSubject}&body=${encodedBody}`
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email {lead.company_name}</DialogTitle>
          <DialogDescription>
            Choose a template and personalize your message. Merge fields have been
            automatically replaced with lead data.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recipient */}
            <div className="space-y-2">
              <Label>To</Label>
              <Input
                value={lead.email || 'No email available'}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Template Selector */}
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject line..."
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter your message..."
                rows={10}
                className="resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={handleSendEmail}
                disabled={!lead.email || !subject}
              >
                <Mail className="mr-2 h-4 w-4" />
                Open in Email Client
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
