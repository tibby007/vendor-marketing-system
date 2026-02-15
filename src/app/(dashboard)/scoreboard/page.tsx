'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { BarChart3, Pencil, Loader2 } from 'lucide-react'

interface Stats {
  leads_found: number
  emails_sent: number
  replies_received: number
  calls_booked: number
  deals_activated: number
}

interface Targets {
  weekly_leads_found: number
  weekly_emails_sent: number
  weekly_replies: number
  weekly_calls_booked: number
  weekly_deals_activated: number
}

interface ScoreboardRow {
  label: string
  statKey: keyof Stats
  targetKey: keyof Targets
}

const ROWS: ScoreboardRow[] = [
  { label: 'Leads Found', statKey: 'leads_found', targetKey: 'weekly_leads_found' },
  { label: 'Emails Sent', statKey: 'emails_sent', targetKey: 'weekly_emails_sent' },
  { label: 'Replies Received', statKey: 'replies_received', targetKey: 'weekly_replies' },
  { label: 'Calls Booked', statKey: 'calls_booked', targetKey: 'weekly_calls_booked' },
  { label: 'Deals Activated', statKey: 'deals_activated', targetKey: 'weekly_deals_activated' },
]

function getWeekRange(): string {
  const now = new Date()
  const day = now.getDay() // 0 = Sunday
  // Calculate Monday (start of week)
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  // Sunday = Monday + 6
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return `Week of ${fmt(monday)} - ${fmt(sunday)}`
}

function StatusDot({ actual, target }: { actual: number; target: number }) {
  let color: string
  let label: string

  if (target === 0) {
    // No target set — show neutral
    color = 'bg-gray-300'
    label = 'No target'
  } else if (actual >= target) {
    color = 'bg-green-500'
    label = 'On track'
  } else if (actual >= target * 0.5) {
    color = 'bg-yellow-500'
    label = 'In progress'
  } else {
    color = 'bg-red-500'
    label = 'Behind'
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-3 w-3 rounded-full ${color}`} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

export default function ScoreboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [targets, setTargets] = useState<Targets | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editTargets, setEditTargets] = useState<Targets | null>(null)

  const fetchScoreboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/scoreboard')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to load scoreboard')
      }
      const data = await res.json()
      setStats(data.stats)
      setTargets(data.targets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scoreboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScoreboard()
  }, [fetchScoreboard])

  const handleOpenDialog = () => {
    if (targets) {
      setEditTargets({ ...targets })
    }
    setDialogOpen(true)
  }

  const handleSaveTargets = async () => {
    if (!editTargets) return

    try {
      setSaving(true)
      const res = await fetch('/api/scoreboard/targets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTargets),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save targets')
      }

      const data = await res.json()
      setTargets(data.targets)
      setDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save targets')
    } finally {
      setSaving(false)
    }
  }

  const handleTargetChange = (field: keyof Targets, value: string) => {
    if (!editTargets) return
    const num = value === '' ? 0 : parseInt(value, 10)
    if (isNaN(num) || num < 0) return
    setEditTargets({ ...editTargets, [field]: num })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchScoreboard}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-orange-500" />
            Weekly Scoreboard
          </h1>
          <p className="text-muted-foreground mt-1">{getWeekRange()}</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={handleOpenDialog}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Targets
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Weekly Targets</DialogTitle>
              <DialogDescription>
                Set your weekly goals for each outreach metric.
              </DialogDescription>
            </DialogHeader>
            {editTargets && (
              <div className="space-y-4 py-2">
                {ROWS.map((row) => (
                  <div key={row.targetKey} className="flex items-center gap-4">
                    <Label htmlFor={row.targetKey} className="w-40 text-sm">
                      {row.label}
                    </Label>
                    <Input
                      id={row.targetKey}
                      type="number"
                      min={0}
                      value={editTargets[row.targetKey]}
                      onChange={(e) => handleTargetChange(row.targetKey, e.target.value)}
                      className="w-24"
                    />
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTargets} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Targets
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error banner (non-blocking) */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Scoreboard Card */}
      <Card>
        <CardHeader>
          <CardTitle>Outreach Progress</CardTitle>
          <CardDescription>
            Track your weekly outreach activity against your targets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Metric</TableHead>
                <TableHead className="text-right">This Week</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats &&
                targets &&
                ROWS.map((row) => {
                  const actual = stats[row.statKey]
                  const target = targets[row.targetKey]
                  return (
                    <TableRow key={row.statKey}>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {actual}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {target}
                      </TableCell>
                      <TableCell>
                        <StatusDot actual={actual} target={target} />
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
