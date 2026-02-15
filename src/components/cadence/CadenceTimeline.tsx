'use client'

import { CADENCE_DAYS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface TimelineStep {
  step_number: number
  status: string
  scheduled_date: string
}

interface CadenceTimelineProps {
  steps: TimelineStep[]
}

export function CadenceTimeline({ steps }: CadenceTimelineProps) {
  const today = new Date().toISOString().split('T')[0]

  const getStepColor = (step: TimelineStep) => {
    if (step.status === 'sent') return 'bg-green-500'
    if (step.status === 'skipped' || step.status === 'cancelled') return 'bg-red-400'
    if (step.status === 'pending' && step.scheduled_date <= today) return 'bg-orange-500'
    return 'bg-gray-300'
  }

  const getLineColor = (fromStep: TimelineStep, toStep: TimelineStep) => {
    if (fromStep.status === 'sent' && toStep.status === 'sent') return 'bg-green-500'
    if (fromStep.status === 'sent') return 'bg-green-300'
    return 'bg-gray-200'
  }

  // Sort steps by step_number
  const sortedSteps = [...steps].sort((a, b) => a.step_number - b.step_number)

  // Pad to 4 steps if less
  const displaySteps: TimelineStep[] = [1, 2, 3, 4].map((num) => {
    const existing = sortedSteps.find((s) => s.step_number === num)
    return existing || { step_number: num, status: 'upcoming', scheduled_date: '' }
  })

  return (
    <div className="flex items-center gap-0 w-full max-w-xs">
      {displaySteps.map((step, idx) => (
        <div key={step.step_number} className="flex items-center flex-1">
          {/* Dot + Label */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-3 h-3 rounded-full shrink-0',
                getStepColor(step)
              )}
              title={`Step ${step.step_number}: ${step.status}`}
            />
            <span className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">
              {CADENCE_DAYS[step.step_number]
                ? `Day ${CADENCE_DAYS[step.step_number].day}`
                : `S${step.step_number}`}
            </span>
          </div>

          {/* Connecting line */}
          {idx < displaySteps.length - 1 && (
            <div
              className={cn(
                'h-0.5 flex-1 mx-0.5',
                getLineColor(step, displaySteps[idx + 1])
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
