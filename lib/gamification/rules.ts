/**
 * Configurable XP rules for gamification engine.
 */
import type { XPRule, XPEventType } from '@/types/gamification'
import {
  XP_CREATE_LEAD,
  XP_FOLLOWUP_ONTIME,
  XP_FIX_MISSING_FIELD,
  XP_DAILY_STREAK,
  XP_WIN_OPPORTUNITY,
  XP_ADVANCE_PHASE,
} from '@/lib/config/constants'

export const XP_RULES: XPRule[] = [
  {
    type: 'create_lead',
    xp: XP_CREATE_LEAD,
    label: 'Lead Created',
    description: 'Create a lead with core fields + next step',
  },
  {
    type: 'followup_ontime',
    xp: XP_FOLLOWUP_ONTIME,
    label: 'On-time Follow-up',
    description: 'Complete a follow-up before it becomes overdue',
  },
  {
    type: 'fix_missing_field',
    xp: XP_FIX_MISSING_FIELD,
    label: 'Field Fixed',
    description: 'Add a missing key field (email, phone, etc.)',
  },
  {
    type: 'daily_streak',
    xp: XP_DAILY_STREAK,
    label: 'Daily Streak',
    description: 'Bonus for maintaining daily activity streak',
  },
  {
    type: 'win_opportunity',
    xp: XP_WIN_OPPORTUNITY,
    label: 'Opportunity gewonnen',
    description: 'Opportunity erfolgreich abgeschlossen',
  },
  {
    type: 'advance_phase',
    xp: XP_ADVANCE_PHASE,
    label: 'Phase vorangebracht',
    description: 'Opportunity in die naechste Phase bewegt',
  },
]

export function getXPForEvent(type: XPEventType): number {
  const rule = XP_RULES.find((r) => r.type === type)
  return rule?.xp ?? 0
}
