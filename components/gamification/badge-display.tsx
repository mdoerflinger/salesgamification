'use client'

import { Zap, Shield, TrendingUp, Flame, Star, Rocket, Lock } from 'lucide-react'
import { useGamification } from '@/lib/gamification/use-gamification'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Badge } from '@/types/gamification'

const BADGE_ICONS: Record<string, React.ElementType> = {
  Zap,
  Shield,
  TrendingUp,
  Flame,
  Star,
  Rocket,
}

export function BadgeDisplay() {
  const { badges } = useGamification()

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">Badges</h3>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {badges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  )
}

function BadgeItem({ badge }: { badge: Badge }) {
  const Icon = BADGE_ICONS[badge.icon] || Star
  const isUnlocked = !!badge.unlockedAt

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors',
              isUnlocked
                ? 'border-primary/20 bg-primary/5'
                : 'border-border bg-muted/50 opacity-50'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              {isUnlocked ? (
                <Icon className="h-5 w-5" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </div>
            <span className="text-[10px] font-medium leading-tight text-foreground">
              {badge.name}
            </span>
            {!isUnlocked && (
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {badge.progress}/{badge.target}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{badge.name}</p>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
          {!isUnlocked && (
            <p className="mt-1 text-xs tabular-nums">
              Progress: {badge.progress}/{badge.target}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
