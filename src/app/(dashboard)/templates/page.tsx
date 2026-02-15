'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EmailTemplate, CadenceAngle } from '@/types/database'
import { CADENCE_ANGLES, CADENCE_DAYS } from '@/lib/constants'
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

const ANGLE_BADGE_COLORS: Record<string, string> = {
  A: 'bg-blue-100 text-blue-700',
  B: 'bg-green-100 text-green-700',
  C: 'bg-orange-100 text-orange-700',
}

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
          .order('cadence_step', { ascending: true })
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
      case 'cadence':
        return 'Cadence'
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
      case 'cadence':
        return 'bg-teal-100 text-teal-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getAngleTemplates = (angle: CadenceAngle) => {
    return templates
      .filter((t) => t.angle === angle && t.category === 'cadence')
      .sort((a, b) => (a.cadence_step || 0) - (b.cadence_step || 0))
  }

  const getStepLabel = (step: number | null) => {
    if (!step) return ''
    return CADENCE_DAYS[step]?.label || `Step ${step}`
  }

  const renderAngleCards = (angle: CadenceAngle) => {
    const angleTemplates = getAngleTemplates(angle)
    const angleInfo = CADENCE_ANGLES.find((a) => a.value === angle)

    if (angleTemplates.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No templates configured for {angleInfo?.label || `Angle ${angle}`}.</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {angleInfo && (
          <p className="text-sm text-gray-500">{angleInfo.description}</p>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {angleTemplates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-xs font-medium">
                      {getStepLabel(template.cadence_step)}
                    </Badge>
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                  </div>
                  <Badge className={ANGLE_BADGE_COLORS[angle] || 'bg-gray-100 text-gray-700'}>
                    {angle}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-medium text-gray-700 mb-1 line-clamp-1">
                  {template.subject}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {template.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
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
          Professional templates for vendor outreach. Cadence templates are organized by angle and send day.
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="A">Angle A</TabsTrigger>
          <TabsTrigger value="B">Angle B</TabsTrigger>
          <TabsTrigger value="C">Angle C</TabsTrigger>
        </TabsList>

        {/* All templates tab */}
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
                      <div className="flex gap-1.5 mt-2">
                        <Badge className={getCategoryColor(template.category)}>
                          {getCategoryLabel(template.category)}
                        </Badge>
                        {template.angle && (
                          <Badge className={ANGLE_BADGE_COLORS[template.angle] || 'bg-gray-100 text-gray-700'}>
                            Angle {template.angle}
                          </Badge>
                        )}
                        {template.cadence_step && (
                          <Badge variant="outline" className="text-xs">
                            {getStepLabel(template.cadence_step)}
                          </Badge>
                        )}
                      </div>
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

        {/* Angle tabs */}
        {(['A', 'B', 'C'] as CadenceAngle[]).map((angle) => (
          <TabsContent key={angle} value={angle} className="mt-6">
            {renderAngleCards(angle)}
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
              {/* Angle + Step badges */}
              {(selectedTemplate.angle || selectedTemplate.cadence_step) && (
                <div className="flex gap-2">
                  {selectedTemplate.angle && (
                    <Badge className={ANGLE_BADGE_COLORS[selectedTemplate.angle] || 'bg-gray-100 text-gray-700'}>
                      Angle {selectedTemplate.angle}
                    </Badge>
                  )}
                  {selectedTemplate.cadence_step && (
                    <Badge variant="outline">
                      {getStepLabel(selectedTemplate.cadence_step)}
                    </Badge>
                  )}
                </div>
              )}

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
