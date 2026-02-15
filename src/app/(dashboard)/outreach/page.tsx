'use client'

import { useState, useEffect, useCallback } from 'react'
import { CADENCE_ANGLES } from '@/lib/constants'
import { CadenceQueue } from '@/components/cadence/CadenceQueue'
import { CadenceTimeline } from '@/components/cadence/CadenceTimeline'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Send, StopCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CadenceStep {
  id: string
  step_number: number
  status: string
  scheduled_date: string
  sent_at: string | null
}

interface CadenceLead {
  id: string
  company_name: string
  contact_name: string | null
  email: string | null
  equipment_types: string[] | null
  status: string
}

interface Cadence {
  id: string
  lead_id: string
  user_id: string
  angle: string
  status: string
  started_at: string
  stopped_at: string | null
  stop_reason: string | null
  created_at: string
  leads: CadenceLead
  cadence_steps: CadenceStep[]
}

const ANGLE_BADGE_COLORS: Record<string, string> = {
  A: 'bg-blue-100 text-blue-700',
  B: 'bg-green-100 text-green-700',
  C: 'bg-orange-100 text-orange-700',
}

export default function OutreachPage() {
  const { toast } = useToast()
  const [cadences, setCadences] = useState<Cadence[]>([])
  const [loading, setLoading] = useState(true)
  const [stoppingId, setStoppingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('active')

  const fetchCadences = useCallback(async () => {
    try {
      const res = await fetch(`/api/cadences?status=${statusFilter}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCadences(data.cadences || [])
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load cadences.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, toast])

  useEffect(() => {
    setLoading(true)
    fetchCadences()
  }, [fetchCadences])

  const handleStop = async (cadenceId: string) => {
    setStoppingId(cadenceId)
    try {
      const res = await fetch(`/api/cadences/${cadenceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'stopped', stop_reason: 'Manually stopped' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({
        title: 'Cadence stopped',
        description: 'All pending steps have been cancelled.',
      })

      fetchCadences()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to stop cadence.',
        variant: 'destructive',
      })
    } finally {
      setStoppingId(null)
    }
  }

  const getAngleLabel = (angle: string) => {
    return CADENCE_ANGLES.find((a) => a.value === angle)?.label || `Angle ${angle}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Send className="h-6 w-6" />
          Outreach
        </h1>
        <p className="text-gray-500">
          Manage your email cadences and send due emails to vendor leads.
        </p>
      </div>

      {/* Due Today Queue */}
      <CadenceQueue />

      {/* Active Cadences Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Cadences</h2>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="stopped">Stopped</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : cadences.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <p className="font-medium">No {statusFilter} cadences</p>
                  <p className="text-sm mt-1">
                    {statusFilter === 'active'
                      ? 'Enroll leads from the My Leads page to start cadences.'
                      : `No cadences with "${statusFilter}" status found.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {cadences.map((cadence) => (
                  <Card key={cadence.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Left: Lead info + badges */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {cadence.leads?.company_name || 'Unknown Lead'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Started {formatDate(cadence.started_at)}
                            </p>
                          </div>
                          <Badge className={ANGLE_BADGE_COLORS[cadence.angle] || 'bg-gray-100 text-gray-700'}>
                            {cadence.angle}
                          </Badge>
                          <span className="text-xs text-gray-400 hidden sm:inline">
                            {getAngleLabel(cadence.angle)}
                          </span>
                        </div>

                        {/* Center: Timeline */}
                        <div className="hidden md:block">
                          <CadenceTimeline
                            steps={(cadence.cadence_steps || []).map((s) => ({
                              step_number: s.step_number,
                              status: s.status,
                              scheduled_date: s.scheduled_date,
                            }))}
                          />
                        </div>

                        {/* Right: Stop button (only for active) */}
                        {cadence.status === 'active' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                            onClick={() => handleStop(cadence.id)}
                            disabled={stoppingId === cadence.id}
                          >
                            {stoppingId === cadence.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <StopCircle className="h-4 w-4 mr-1" />
                                Stop
                              </>
                            )}
                          </Button>
                        )}

                        {/* Status badge for completed/stopped */}
                        {cadence.status === 'completed' && (
                          <Badge className="bg-green-100 text-green-700 shrink-0">
                            Completed
                          </Badge>
                        )}
                        {cadence.status === 'stopped' && (
                          <Badge className="bg-red-100 text-red-700 shrink-0">
                            Stopped
                          </Badge>
                        )}
                      </div>

                      {/* Mobile timeline */}
                      <div className="md:hidden mt-3 pt-3 border-t">
                        <CadenceTimeline
                          steps={(cadence.cadence_steps || []).map((s) => ({
                            step_number: s.step_number,
                            status: s.status,
                            scheduled_date: s.scheduled_date,
                          }))}
                        />
                      </div>

                      {/* Stop reason if stopped */}
                      {cadence.stop_reason && (
                        <p className="text-xs text-gray-400 mt-2">
                          Reason: {cadence.stop_reason}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
