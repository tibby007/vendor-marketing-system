'use client'

import { useState } from 'react'
import { CADENCE_ANGLES } from '@/lib/constants'
import { CadenceAngle } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Lead {
  id: string
  company_name: string
  email?: string | null
  equipment_types?: string[] | null
}

interface EnrollCadenceDialogProps {
  lead: Lead
  open: boolean
  onClose: () => void
  onEnrolled: () => void
}

const ANGLE_BADGE_COLORS: Record<string, string> = {
  A: 'bg-blue-100 text-blue-700',
  B: 'bg-green-100 text-green-700',
  C: 'bg-orange-100 text-orange-700',
}

export function EnrollCadenceDialog({
  lead,
  open,
  onClose,
  onEnrolled,
}: EnrollCadenceDialogProps) {
  const { toast } = useToast()
  const [enrolling, setEnrolling] = useState<CadenceAngle | null>(null)

  const handleEnroll = async (angle: CadenceAngle) => {
    setEnrolling(angle)
    try {
      const res = await fetch('/api/cadences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id, angle }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to enroll in cadence')
      }

      toast({
        title: 'Cadence started!',
        description: `${lead.company_name} enrolled in Angle ${angle} cadence.`,
      })

      onEnrolled()
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start cadence.',
        variant: 'destructive',
      })
    } finally {
      setEnrolling(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Start Cadence for {lead.company_name}</DialogTitle>
          <DialogDescription>
            Choose an outreach angle. A 4-step email cadence will be created on
            Days 1, 3, 7, and 14.
          </DialogDescription>
        </DialogHeader>

        {/* Warning if no email */}
        {!lead.email && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">No email address</p>
              <p>This lead does not have an email. You can still create the cadence, but you will need to add an email before sending.</p>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {CADENCE_ANGLES.map((angle) => (
            <Card
              key={angle.value}
              className={`cursor-pointer border-2 transition-all hover:shadow-md ${angle.theme} ${
                enrolling ? 'opacity-60 pointer-events-none' : ''
              }`}
              onClick={() => handleEnroll(angle.value as CadenceAngle)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={ANGLE_BADGE_COLORS[angle.value]}>
                        {angle.value}
                      </Badge>
                      <span className="font-semibold text-sm">{angle.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{angle.description}</p>
                  </div>
                  {enrolling === angle.value && (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500 shrink-0 ml-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
