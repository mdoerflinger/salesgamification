'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GamificationState, XPEventType, Badge } from '@/types/gamification'
import { processXPEvent, createInitialGamificationState } from './engine'
import { checkBadgeProgress } from './badges'

interface GamificationStore extends GamificationState {
  awardXP: (type: XPEventType, description: string) => { xpAwarded: number; leveledUp: boolean }
  resetState: () => void
  // Transient UI state
  lastXPAward: { xp: number; description: string; type: XPEventType } | null
  clearLastAward: () => void
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      ...createInitialGamificationState(),
      lastXPAward: null,

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

        set({
          ...newState,
          badges: updatedBadges,
          lastXPAward: { xp: xpAwarded, description, type },
        })

        return { xpAwarded, leveledUp }
      },

      resetState: () => {
        set({ ...createInitialGamificationState(), lastXPAward: null })
      },

      clearLastAward: () => {
        set({ lastXPAward: null })
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
      }),
    }
  )
)
