'use client'

import { useGamificationStore } from './store'
import { getLevelInfo } from './engine'
import type { XPEventType } from '@/types/gamification'

/**
 * Convenience hook for gamification in components.
 */
export function useGamification() {
  const store = useGamificationStore()
  const levelInfo = getLevelInfo(store.xp)

  return {
    xp: store.xp,
    level: levelInfo.level,
    levelProgress: levelInfo.progress,
    currentLevelXP: levelInfo.currentXP,
    xpForNextLevel: levelInfo.xpForNextLevel,
    streakDays: store.streakDays,
    badges: store.badges,
    history: store.history,
    lastXPAward: store.lastXPAward,

    awardXP: store.awardXP,
    clearLastAward: store.clearLastAward,
    resetState: store.resetState,
  }
}
