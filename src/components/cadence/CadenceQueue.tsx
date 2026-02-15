'use client'

import { useState, useEffect, useCallback } from 'react'
import { CADENCE_DAYS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Mail,
  Check,
  SkipForward,
  ChevronDown,
  ChevronUp,
  Loader2,
  Inbox,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DueStep {
  id: string
  cadence_id: string
  step_number: number
  scheduled_date: string
  status: string
  template_id: string | null
  angle: string | null
  lead_id: string | null
  lead: {
    id: string
    company_name: string
    contact_name: string | null
    email: string | null
  } | null
  subject: string
  body: string
}

const ANGLE_BADGE_COLORS: Record<string, string> = {
  A: 'bg-blue-100 text-blue-700',
  B: 'bg-green-100 text-green-700',
  C: 'bg-orange-100 text-orange-700',
}

export function CadenceQueue() {
  const { toast } = useToast()
  const [steps, setSteps] = useState<DueStep[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editedSubjects, setEditedSubjects] = useState<Record<string, string>>({})
  const [editedBodies, setEditedBodies] = useState<Record<string, string>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchDueSteps = useCallback(async () => {
    try {
      const res = await fetch('/api/cadences/due')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSteps(data.steps || [])
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load due emails.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchDueSteps()
  }, [fetchDueSteps])

  const getSubject = (step: DueStep) => editedSubjects[step.id] ?? step.subject
  const getBody = (step: DueStep) => editedBodies[step.id] ?? step.body

  const handleOpenEmail = (step: DueStep) => {
    if (!step.lead?.email) {
      toast({
        title: 'No email address',
        description: 'This lead does not have an email address.',
        variant: 'destructive',
      })
      return
    }

    const subject = encodeURIComponent(getSubject(step))
    const body = encodeURIComponent(getBody(step))
    window.open(`mailto:${step.lead.email}?subject=${subject}&body=${body}`, '_blank')
  }

  const handleMarkSent = async (step: DueStep) => {
    setActionLoading(step.id)
    try {
      const res = await fetch('/api/cadences/mark-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step_id: step.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({
        title: 'Marked as sent',
        description: `Step ${step.step_number} for ${step.lead?.company_name} marked as sent.`,
      })

      // Remove from list
      setSteps((prev) => prev.filter((s) => s.id !== step.id))
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mark as sent.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSkip = async (step: DueStep) => {
    setActionLoading(step.id)
    try {
      const res = await fetch('/api/cadences/skip-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step_id: step.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({
        title: 'Step skipped',
        description: `Step ${step.step_number} for ${step.lead?.company_name} was skipped.`,
      })

      setSteps((prev) => prev.filter((s) => s.id !== step.id))
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to skip step.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStepLabel = (stepNumber: number) => {
    return CADENCE_DAYS[stepNumber]?.label || `Step ${stepNumber}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Due Today
            {steps.length > 0 && (
              <Badge className="bg-orange-500 text-white">{steps.length}</Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {steps.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Inbox className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">No emails due today</p>
            <p className="text-sm">Check back tomorrow or enroll more leads in cadences.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step) => {
              const isExpanded = expandedId === step.id
              const isLoading = actionLoading === step.id

              return (
                <div
                  key={step.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-medium text-sm truncate">
                        {step.lead?.company_name || 'Unknown'}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {getStepLabel(step.step_number)}
                      </Badge>
                      {step.angle && (
                        <Badge className={`text-xs shrink-0 ${ANGLE_BADGE_COLORS[step.angle] || ''}`}>
                          {step.angle}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : step.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Subject line (always visible, editable) */}
                  <Input
                    value={getSubject(step)}
                    onChange={(e) =>
                      setEditedSubjects((prev) => ({ ...prev, [step.id]: e.target.value }))
                    }
                    className="text-sm"
                    placeholder="Subject..."
                  />

                  {/* Body (expanded) */}
                  {isExpanded && (
                    <Textarea
                      value={getBody(step)}
                      onChange={(e) =>
                        setEditedBodies((prev) => ({ ...prev, [step.id]: e.target.value }))
                      }
                      rows={8}
                      className="text-sm"
                    />
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={() => handleOpenEmail(step)}
                      disabled={isLoading || !step.lead?.email}
                    >
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      Open in Email
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkSent(step)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5 mr-1" />
                      )}
                      Mark as Sent
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSkip(step)}
                      disabled={isLoading}
                      className="text-gray-500"
                    >
                      <SkipForward className="h-3.5 w-3.5 mr-1" />
                      Skip
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
