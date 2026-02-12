'use client'

import { Trophy, Sparkles } from 'lucide-react'
import { ProgressBar } from '@/components/ds/progress-bar'
import { useGamification } from '@/lib/gamification/use-gamification'

export function XPBar() {
  const { level, levelProgress, currentLevelXP, xpForNextLevel, xp } = useGamification()

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          <span className="font-heading text-lg font-semibold text-foreground">
            Level {level}
          </span>
        </div>
        <span className="text-sm text-muted-foreground tabular-nums">
          {xp} XP total
        </span>
      </div>
      <ProgressBar
        value={currentLevelXP}
        max={xpForNextLevel}
        showValue
        label={`${currentLevelXP} / ${xpForNextLevel} XP to next level`}
        color="primary"
      />
    </div>
  )
}
