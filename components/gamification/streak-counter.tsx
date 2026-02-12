'use client'

import { Flame } from 'lucide-react'
import { useGamification } from '@/lib/gamification/use-gamification'

export function StreakCounter() {
  const { streakDays } = useGamification()

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
        <Flame className="h-5 w-5 text-destructive" />
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums text-foreground">
          {streakDays}
        </p>
        <p className="text-xs text-muted-foreground">
          {streakDays === 1 ? 'day streak' : 'day streak'}
        </p>
      </div>
    </div>
  )
}
