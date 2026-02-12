/**
 * Badge definitions and unlock logic.
 */
import type { Badge, GamificationState } from '@/types/gamification'

export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt' | 'progress'>[] = [
  {
    id: 'followup_ninja',
    name: 'Follow-up Ninja',
    description: 'Complete 10 on-time follow-ups in a row',
    icon: 'Zap',
    target: 10,
  },
  {
    id: 'data_hygiene_hero',
    name: 'Data Hygiene Hero',
    description: 'Fix 50 missing fields across leads',
    icon: 'Shield',
    target: 50,
  },
  {
    id: 'pipeline_pro',
    name: 'Pipeline Pro',
    description: 'Create 25 leads',
    icon: 'TrendingUp',
    target: 25,
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 7-day activity streak',
    icon: 'Flame',
    target: 7,
  },
  {
    id: 'first_lead',
    name: 'First Step',
    description: 'Create your first lead',
    icon: 'Star',
    target: 1,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Create 5 leads in a single day',
    icon: 'Rocket',
    target: 5,
  },
  {
    id: 'deal_closer',
    name: 'Deal Closer',
    description: '5 Opportunities erfolgreich abgeschlossen',
    icon: 'Trophy',
    target: 5,
  },
]

/**
 * Check if any badges should be unlocked based on current state.
 */
export function checkBadgeProgress(state: GamificationState): Badge[] {
  const now = new Date().toISOString()
  const existingBadgeIds = new Set(state.badges.map((b) => b.id))

  // Count events by type
  const createLeadCount = state.history.filter((e) => e.type === 'create_lead').length
  const followUpCount = state.history.filter((e) => e.type === 'followup_ontime').length
  const fixFieldCount = state.history.filter((e) => e.type === 'fix_missing_field').length
  const winOpportunityCount = state.history.filter((e) => e.type === 'win_opportunity').length

  return BADGE_DEFINITIONS.map((def) => {
    const existing = state.badges.find((b) => b.id === def.id)

    let progress = 0
    switch (def.id) {
      case 'followup_ninja':
        progress = followUpCount
        break
      case 'data_hygiene_hero':
        progress = fixFieldCount
        break
      case 'pipeline_pro':
        progress = createLeadCount
        break
      case 'streak_master':
        progress = state.streakDays
        break
      case 'first_lead':
        progress = Math.min(createLeadCount, 1)
        break
      case 'speed_demon': {
        const today = new Date().toISOString().slice(0, 10)
        progress = state.history.filter(
          (e) => e.type === 'create_lead' && e.timestamp.slice(0, 10) === today
        ).length
        break
      }
      case 'deal_closer':
        progress = winOpportunityCount
        break
    }

    const isUnlocked = progress >= def.target
    return {
      ...def,
      progress: Math.min(progress, def.target),
      unlockedAt: isUnlocked
        ? existing?.unlockedAt || now
        : null,
    }
  })
}
