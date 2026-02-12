'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Mic, CalendarCheck, Users, Sparkles, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/ds/page-header'
import { StatCard } from '@/components/ds/stat-card'
import { EmptyState } from '@/components/ds/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XPBar } from '@/components/gamification/xp-bar'
import { StreakCounter } from '@/components/gamification/streak-counter'
import { BadgeDisplay } from '@/components/gamification/badge-display'
import { FollowUpCard } from '@/components/follow-ups/follow-up-card'
import { VoiceDialog } from '@/components/voice/voice-dialog'
import { useGamification } from '@/lib/gamification/use-gamification'
import { ROUTES } from '@/lib/config/constants'
import type { FollowUpItem, VoiceIntent } from '@/types'

// Demo follow-ups for initial scaffold
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
]

export default function TodayPage() {
  const [voiceOpen, setVoiceOpen] = useState(false)
  const { awardXP, xp, level, streakDays } = useGamification()

  const overdueItems = DEMO_FOLLOW_UPS.filter((f) => f.group === 'overdue')
  const todayItems = DEMO_FOLLOW_UPS.filter((f) => f.group === 'today')

  const handleComplete = (id: string) => {
    awardXP('followup_ontime', 'Completed follow-up')
  }

  const handleVoiceIntent = (intent: VoiceIntent) => {
    // In production, this would route to the appropriate action
    if (intent.type === 'create_lead') {
      window.location.href = ROUTES.LEADS_NEW
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Today"
        description="Your prioritized actions for today."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setVoiceOpen(true)}
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              Voice
            </Button>
            <Link href={ROUTES.LEADS_NEW}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Quick Add
              </Button>
            </Link>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total XP"
          value={xp}
          trend="up"
          description={`Level ${level}`}
          icon={<Sparkles />}
        />
        <StatCard
          label="Streak"
          value={`${streakDays}d`}
          trend={streakDays > 0 ? 'up' : 'neutral'}
          description="Daily activity"
          icon={<CalendarCheck />}
        />
        <StatCard
          label="Due Today"
          value={todayItems.length}
          trend="neutral"
          description="Follow-ups"
          icon={<CalendarCheck />}
        />
        <StatCard
          label="Overdue"
          value={overdueItems.length}
          trend={overdueItems.length > 0 ? 'down' : 'neutral'}
          description="Needs attention"
          icon={<Users />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Follow-ups */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Due Follow-ups</CardTitle>
              <Link href={ROUTES.FOLLOW_UPS}>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {overdueItems.length > 0 && (
                <div className="mb-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-destructive">
                    Overdue
                  </p>
                  {overdueItems.map((item) => (
                    <FollowUpCard
                      key={item.id}
                      item={item}
                      onComplete={handleComplete}
                    />
                  ))}
                </div>
              )}
              {todayItems.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Today
                  </p>
                  {todayItems.map((item) => (
                    <FollowUpCard
                      key={item.id}
                      item={item}
                      onComplete={handleComplete}
                    />
                  ))}
                </div>
              )}
              {overdueItems.length === 0 && todayItems.length === 0 && (
                <EmptyState
                  title="All caught up"
                  description="No follow-ups due today. Great work!"
                  icon={<CalendarCheck />}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gamification sidebar */}
        <div className="flex flex-col gap-4">
          <XPBar />
          <StreakCounter />
          <BadgeDisplay />
        </div>
      </div>

      <VoiceDialog
        open={voiceOpen}
        onOpenChange={setVoiceOpen}
        onConfirmIntent={handleVoiceIntent}
      />
    </div>
  )
}
