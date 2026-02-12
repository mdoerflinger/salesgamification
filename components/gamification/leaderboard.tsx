'use client'

import { Trophy, Flame } from 'lucide-react'
import type { LeaderboardEntry } from '@/types/gamification'
import { cn } from '@/lib/utils'

// Sample data for client-side leaderboard
const SAMPLE_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, userId: '1', displayName: 'Anna M.', xp: 1250, level: 13, streakDays: 14 },
  { rank: 2, userId: '2', displayName: 'Thomas K.', xp: 980, level: 10, streakDays: 7 },
  { rank: 3, userId: '3', displayName: 'Sarah L.', xp: 820, level: 9, streakDays: 12 },
  { rank: 4, userId: '4', displayName: 'Michael R.', xp: 650, level: 7, streakDays: 3 },
  { rank: 5, userId: '5', displayName: 'Julia W.', xp: 420, level: 5, streakDays: 5 },
]

export function Leaderboard() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">Leaderboard</h3>
      <div className="rounded-lg border border-border bg-card">
        {SAMPLE_ENTRIES.map((entry, index) => (
          <div
            key={entry.userId}
            className={cn(
              'flex items-center gap-3 px-4 py-3',
              index !== SAMPLE_ENTRIES.length - 1 && 'border-b border-border'
            )}
          >
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                entry.rank === 1 && 'bg-warning/20 text-warning',
                entry.rank === 2 && 'bg-muted text-muted-foreground',
                entry.rank === 3 && 'bg-warning/10 text-warning/70',
                entry.rank > 3 && 'bg-muted/50 text-muted-foreground'
              )}
            >
              {entry.rank}
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {entry.displayName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{entry.displayName}</p>
              <p className="text-xs text-muted-foreground">Level {entry.level}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-destructive" />
                {entry.streakDays}d
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {entry.xp} XP
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Sample data. Privacy-first: opt-in only.
      </p>
    </div>
  )
}
