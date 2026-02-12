/**
 * Gamification types for the Sales Lead Coach.
 */

export interface GamificationState {
  xp: number
  level: number
  badges: Badge[]
  streakDays: number
  lastActivityDate: string | null
  history: XPEvent[]
}

export interface XPEvent {
  id: string
  type: XPEventType
  xp: number
  description: string
  timestamp: string
}

export type XPEventType =
  | 'create_lead'
  | 'followup_ontime'
  | 'fix_missing_field'
  | 'daily_streak'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string | null
  progress: number
  target: number
}

export interface XPRule {
  type: XPEventType
  xp: number
  label: string
  description: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  avatar?: string
  xp: number
  level: number
  streakDays: number
}

export interface LevelInfo {
  level: number
  currentXP: number
  xpForNextLevel: number
  progress: number // 0-100
}
