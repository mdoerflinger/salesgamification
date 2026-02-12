'use client'

import { useEffect, useState } from 'react'
import { useGamification } from '@/lib/gamification/use-gamification'
import { Trophy, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function XPAwardBanner() {
  const { lastXPAward, clearLastAward } = useGamification()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (lastXPAward) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(clearLastAward, 300)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [lastXPAward, clearLastAward])

  if (!lastXPAward) return null

  return (
    <div
      className={cn(
        'fixed left-1/2 top-4 z-50 -translate-x-1/2 transition-all duration-300',
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-4 opacity-0'
      )}
    >
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 shadow-lg backdrop-blur">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            +{lastXPAward.xp} XP
          </p>
          <p className="text-xs text-muted-foreground">
            {lastXPAward.description}
          </p>
        </div>
      </div>
    </div>
  )
}
