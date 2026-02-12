'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GamificationState, XPEventType, Badge } from '@/types/gamification'
import { processXPEvent, createInitialGamificationState } from './engine'
import { checkBadgeProgress } from './badges'

interface GamificationStore extends GamificationState {
  awardXP: (type: XPEventType, description: string) => { xpAwarded: number; leveledUp: boolean; newBadges: Badge[] }
  resetState: () => void
  // Transient UI state
  lastXPAward: { xp: number; description: string; type: XPEventType } | null
  clearLastAward: () => void
  celebration: { type: 'level-up' | 'badge' | 'streak'; title: string; description?: string } | null
  clearCelebration: () => void
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      ...createInitialGamificationState(),
      lastXPAward: null,
      celebration: null,

      awardXP: (type: XPEventType, description: string) => {
        const currentState = get()
        const { newState, xpAwarded, leveledUp } = processXPEvent(
          {
            xp: currentState.xp,
            level: currentState.level,
            badges: currentState.badges,
            streakDays: currentState.streakDays,
            lastActivityDate: currentState.lastActivityDate,
            history: currentState.history,
          },
          type,
          description
        )

        // Check badge progress with new state
        const updatedBadges = checkBadgeProgress(newState)
        const newBadges = updatedBadges.filter(
          (badge) => badge.unlockedAt && 
          !currentState.badges.find(b => b.id === badge.id)?.unlockedAt
        )

        // Trigger celebrations
        let celebration = null
        if (leveledUp) {
          celebration = {
            type: 'level-up' as const,
            title: `Level ${newState.level} Erreicht!`,
            description: `Du hast Level ${newState.level} erreicht. Weiter so!`,
          }
        } else if (newBadges.length > 0) {
          const badge = newBadges[0]
          celebration = {
            type: 'badge' as const,
            title: `${badge.name} Badge!`,
            description: badge.description,
          }
        } else if (newState.streakDays % 7 === 0 && newState.streakDays > currentState.streakDays) {
          celebration = {
            type: 'streak' as const,
            title: `${newState.streakDays} Tage Streak!`,
            description: 'Unglaublich! Du bist auf Feuer!',
          }
        }

        set({
          ...newState,
          badges: updatedBadges,
          lastXPAward: { xp: xpAwarded, description, type },
          celebration,
        })

        return { xpAwarded, leveledUp, newBadges }
      },

      resetState: () => {
        set({ ...createInitialGamificationState(), lastXPAward: null, celebration: null })
      },

      clearLastAward: () => {
        set({ lastXPAward: null })
      },

      clearCelebration: () => {
        set({ celebration: null })
      },
    }),
    {
      name: 'sales-lead-coach-gamification',
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        badges: state.badges,
        streakDays: state.streakDays,
        lastActivityDate: state.lastActivityDate,
        history: state.history,
        // Don't persist UI state
      }),
    }
  )
)
