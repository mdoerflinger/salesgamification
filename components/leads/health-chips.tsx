'use client'

import { AlertTriangle, Mail, Phone, Building2, User, CalendarClock, Clock } from 'lucide-react'
import type { HealthIssue } from '@/types'
import { cn } from '@/lib/utils'

const ISSUE_CONFIG: Record<HealthIssue, { label: string; icon: React.ElementType; action?: string }> = {
  missing_email: { label: 'No email', icon: Mail, action: 'Add email' },
  missing_phone: { label: 'No phone', icon: Phone, action: 'Add phone' },
  no_next_step: { label: 'No follow-up', icon: CalendarClock, action: 'Schedule' },
  stale: { label: 'Stale', icon: Clock },
  missing_company: { label: 'No company', icon: Building2, action: 'Add company' },
  missing_contact_name: { label: 'No name', icon: User, action: 'Add name' },
}

interface HealthChipsProps {
  issues: HealthIssue[]
  onFix?: (issue: HealthIssue) => void
  compact?: boolean
}

export function HealthChips({ issues, onFix, compact = false }: HealthChipsProps) {
  if (issues.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {issues.map((issue) => {
        const config = ISSUE_CONFIG[issue]
        const Icon = config.icon

        return (
          <button
            key={issue}
            onClick={() => onFix?.(issue)}
            disabled={!onFix || !config.action}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
              issue === 'stale'
                ? 'border-warning/20 bg-warning/10 text-warning'
                : 'border-destructive/20 bg-destructive/10 text-destructive',
              onFix && config.action && 'cursor-pointer hover:opacity-80'
            )}
          >
            <Icon className="h-3 w-3" />
            {!compact && <span>{config.action || config.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
