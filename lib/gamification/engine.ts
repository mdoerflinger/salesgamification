/**
 * Gamification engine: XP calculation, levels, streaks.
 */
import type { LevelInfo, XPEventType, XPEvent, GamificationState } from '@/types/gamification'
import { XP_PER_LEVEL } from '@/lib/config/constants'
import { getXPForEvent } from './rules'

/**
 * Calculate level info from total XP.
 */
export function getLevelInfo(xp: number): LevelInfo {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const currentLevelXP = xp % XP_PER_LEVEL
  return {
    level,
    currentXP: currentLevelXP,
    xpForNextLevel: XP_PER_LEVEL,
    progress: (currentLevelXP / XP_PER_LEVEL) * 100,
  }
}

/**
 * Check if today continues the streak or breaks it.
 */
export function calculateStreak(lastActivityDate: string | null): {
  streakContinues: boolean
  isNewDay: boolean
} {
  if (!lastActivityDate) {
    return { streakContinues: false, isNewDay: true }
  }

  const last = new Date(lastActivityDate)
  const now = new Date()
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.floor(
    (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) return { streakContinues: true, isNewDay: false }
  if (diffDays === 1) return { streakContinues: true, isNewDay: true }
  return { streakContinues: false, isNewDay: true }
}

/**
 * Process an XP event and return the updated state.
 */
export function processXPEvent(
  state: GamificationState,
  eventType: XPEventType,
  description: string
): { newState: GamificationState; xpAwarded: number; leveledUp: boolean } {
  const xp = getXPForEvent(eventType)
  const { streakContinues, isNewDay } = calculateStreak(state.lastActivityDate)

  let newStreakDays = state.streakDays
  let bonusXP = 0

  if (isNewDay) {
    if (streakContinues) {
      newStreakDays += 1
      bonusXP = getXPForEvent('daily_streak')
    } else {
      newStreakDays = 1
    }
  }

  const totalXP = state.xp + xp + bonusXP
  const oldLevel = getLevelInfo(state.xp).level
  const newLevel = getLevelInfo(totalXP).level

  const event: XPEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: eventType,
    xp: xp + bonusXP,
    description,
    timestamp: new Date().toISOString(),
  }

  return {
    newState: {
      ...state,
      xp: totalXP,
      level: newLevel,
      streakDays: newStreakDays,
      lastActivityDate: new Date().toISOString(),
      history: [event, ...state.history].slice(0, 100), // Keep last 100 events
    },
    xpAwarded: xp + bonusXP,
    leveledUp: newLevel > oldLevel,
  }
}

/**
 * Get initial gamification state.
 */
export function createInitialGamificationState(): GamificationState {
  return {
    xp: 0,
    level: 1,
    badges: [],
    streakDays: 0,
    lastActivityDate: null,
    history: [],
  }
}
