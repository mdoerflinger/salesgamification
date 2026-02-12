'use client'

import { useState } from 'react'
import { CalendarCheck, Clock, CalendarDays, CalendarRange } from 'lucide-react'
import { PageHeader } from '@/components/ds/page-header'
import { EmptyState } from '@/components/ds/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FollowUpCard } from '@/components/follow-ups/follow-up-card'
import { useGamification } from '@/lib/gamification/use-gamification'
import { FOLLOW_UP_GROUP_LABELS } from '@/lib/activities/service'
import type { FollowUpItem, FollowUpGroup } from '@/types'
import { toast } from 'sonner'

const DEMO_FOLLOW_UPS: FollowUpItem[] = [
  {
    id: '1',
    subject: 'Discuss pricing proposal',
    leadId: 'lead-1',
    leadName: 'Anna Mueller',
    companyName: 'TechVentures GmbH',
    scheduledDate: new Date().toISOString(),
    priority: 2,
    status: 0,
    group: 'today',
  },
  {
    id: '2',
    subject: 'Send product brochure',
    leadId: 'lead-2',
    leadName: 'Thomas Weber',
    companyName: 'DataFlow AG',
    scheduledDate: new Date(Date.now() - 86400000).toISOString(),
    priority: 1,
    status: 0,
    group: 'overdue',
  },
  {
    id: '3',
    subject: 'Initial discovery call',
    leadId: 'lead-3',
    leadName: 'Sarah Koch',
    companyName: 'CloudFirst Inc',
    scheduledDate: new Date(Date.now() + 172800000).toISOString(),
    priority: 1,
    status: 0,
    group: 'this_week',
  },
  {
    id: '4',
    subject: 'Technical deep dive meeting',
    leadId: 'lead-1',
    leadName: 'Anna Mueller',
    companyName: 'TechVentures GmbH',
    scheduledDate: new Date(Date.now() + 604800000).toISOString(),
    priority: 0,
    status: 0,
    group: 'later',
  },
  {
    id: '5',
    subject: 'Quarterly check-in',
    leadId: 'lead-4',
    leadName: 'Michael Braun',
    companyName: 'InnoSys Solutions',
    scheduledDate: new Date(Date.now() + 1209600000).toISOString(),
    priority: 0,
    status: 0,
    group: 'later',
  },
]

const GROUP_ICONS: Record<FollowUpGroup, React.ElementType> = {
  overdue: Clock,
  today: CalendarCheck,
  this_week: CalendarDays,
  later: CalendarRange,
}

const GROUP_ORDER: FollowUpGroup[] = ['overdue', 'today', 'this_week', 'later']

export default function FollowUpsPage() {
  const { awardXP } = useGamification()
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const grouped = GROUP_ORDER.reduce(
    (acc, group) => {
      acc[group] = DEMO_FOLLOW_UPS.filter(
        (f) => f.group === group && !completedIds.has(f.id)
      )
      return acc
    },
    {} as Record<FollowUpGroup, FollowUpItem[]>
  )

  const handleComplete = (id: string) => {
    setCompletedIds((prev) => new Set([...prev, id]))
    awardXP('followup_ontime', 'Completed follow-up on time')
    toast.success('Follow-up completed! +5 XP')
  }

  const totalPending = Object.values(grouped).reduce((sum, items) => sum + items.length, 0)

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Follow-ups"
        description={`${totalPending} pending follow-ups`}
      />

      {/* Kanban-style columns */}
      <div className="grid gap-4 lg:grid-cols-4">
        {GROUP_ORDER.map((group) => {
          const items = grouped[group]
          const Icon = GROUP_ICONS[group]

          return (
            <Card key={group} className={group === 'overdue' && items.length > 0 ? 'border-destructive/30' : undefined}>
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <Icon className={`h-4 w-4 ${group === 'overdue' ? 'text-destructive' : 'text-muted-foreground'}`} />
                <CardTitle className={`text-sm ${group === 'overdue' ? 'text-destructive' : ''}`}>
                  {FOLLOW_UP_GROUP_LABELS[group]}
                </CardTitle>
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {items.length}
                </span>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {items.length > 0 ? (
                  items.map((item) => (
                    <FollowUpCard
                      key={item.id}
                      item={item}
                      onComplete={handleComplete}
                    />
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    {group === 'overdue' ? 'None overdue' : 'No items'}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
