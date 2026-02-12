'use client'

import { CheckCircle2, Clock, Phone, Mail, Users, MoreHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ds/status-badge'
import type { FollowUpItem } from '@/types'
import { format, isPast, isToday } from 'date-fns'

interface FollowUpCardProps {
  item: FollowUpItem
  onComplete?: (id: string) => void
  isCompleting?: boolean
}

export function FollowUpCard({ item, onComplete, isCompleting }: FollowUpCardProps) {
  const scheduledDate = new Date(item.scheduledDate)
  const overdue = isPast(scheduledDate) && !isToday(scheduledDate)

  return (
    <Card className={overdue ? 'border-destructive/30' : undefined}>
      <CardContent className="flex items-center gap-3 p-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onComplete?.(item.id)}
          disabled={isCompleting || item.status === 1}
          aria-label="Complete follow-up"
        >
          <CheckCircle2
            className={`h-5 w-5 ${
              item.status === 1
                ? 'text-success'
                : 'text-muted-foreground hover:text-success'
            }`}
          />
        </Button>

        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium text-foreground">
            {item.subject}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{item.leadName}</span>
            {item.companyName && (
              <>
                <span>{'at'}</span>
                <span className="truncate">{item.companyName}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`text-xs tabular-nums ${
              overdue ? 'font-medium text-destructive' : 'text-muted-foreground'
            }`}
          >
            {format(scheduledDate, 'MMM d')}
          </span>
          {item.priority === 2 && (
            <StatusBadge status="destructive" dot={false}>
              High
            </StatusBadge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
