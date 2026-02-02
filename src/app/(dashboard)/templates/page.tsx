'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EmailTemplate } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Copy, Mail, Check, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TemplatesPage() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [copied, setCopied] = useState(false)

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

    fetchTemplates()
  }, [toast])

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: 'Copied!',
      description: 'Template copied to clipboard.',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUseTemplate = (template: EmailTemplate) => {
    const subject = encodeURIComponent(template.subject)
    const body = encodeURIComponent(template.body)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const getCategoryLabel = (category: string | null) => {
    switch (category) {
      case 'intro':
        return 'Introduction'
      case 'follow_up':
        return 'Follow Up'
      case 'partnership':
        return 'Partnership'
      default:
        return 'Custom'
    }
  }

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'intro':
        return 'bg-blue-100 text-blue-700'
      case 'follow_up':
        return 'bg-yellow-100 text-yellow-700'
      case 'partnership':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-gray-500">
          Professional templates for vendor outreach.
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="intro">Introduction</TabsTrigger>
          <TabsTrigger value="follow_up">Follow Up</TabsTrigger>
          <TabsTrigger value="partnership">Partnership</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge
                        className={`mt-2 ${getCategoryColor(template.category)}`}
                      >
                        {getCategoryLabel(template.category)}
                      </Badge>
                    </div>
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {template.subject}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {['intro', 'follow_up', 'partnership'].map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates
                .filter((t) => t.category === category)
                .map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {template.subject}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Empty state */}
      {templates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No templates available
            </h3>
            <p className="text-gray-500">
              Templates will appear here once they are configured.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Template Preview Dialog */}
      <Dialog
        open={!!selectedTemplate}
        onOpenChange={() => setSelectedTemplate(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Use merge fields like {'{{company_name}}'}, {'{{contact_name}}'}, and{' '}
              {'{{equipment_type}}'} to personalize your message.
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Subject
                </label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  {selectedTemplate.subject}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Body</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm whitespace-pre-wrap">
                  {selectedTemplate.body}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleCopy(selectedTemplate.body)}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  onClick={() => handleUseTemplate(selectedTemplate)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Open in Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
