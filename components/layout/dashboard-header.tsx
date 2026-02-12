'use client'

import { useGamification } from '@/lib/gamification/use-gamification'
import { useOnlineStatus } from '@/lib/sync/use-online-status'
import { ProgressBar } from '@/components/ds/progress-bar'
import { Trophy, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardHeader() {
  const { xp, level, levelProgress, xpForNextLevel, currentLevelXP } = useGamification()
  const isOnline = useOnlineStatus()

  return (
    <header className="flex items-center gap-4 border-b border-border bg-card px-6 py-3">
      <div className="flex flex-1 items-center gap-4">
        {/* XP progress */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-warning" />
            <span className="text-sm font-semibold text-foreground">
              Level {level}
            </span>
          </div>
          <div className="w-32">
            <ProgressBar
              value={currentLevelXP}
              max={xpForNextLevel}
              color="primary"
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {currentLevelXP}/{xpForNextLevel} XP
          </span>
        </div>
      </div>

      {/* Online status indicator */}
      {!isOnline && (
        <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
          <WifiOff className="h-3.5 w-3.5" />
          Offline
        </div>
      )}
    </header>
  )
}
