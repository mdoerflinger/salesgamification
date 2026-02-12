/**
 * App-wide constants for the Sales Lead Coach.
 */

// ── XP Values ──
export const XP_CREATE_LEAD = 10
export const XP_FOLLOWUP_ONTIME = 5
export const XP_FIX_MISSING_FIELD = 3
export const XP_DAILY_STREAK = 1
export const XP_WIN_OPPORTUNITY = 25
export const XP_ADVANCE_PHASE = 5

// ── Level Thresholds ──
export const XP_PER_LEVEL = 100

// ── Stale Lead ──
export const STALE_LEAD_DAYS = 14

// ── Dataverse Pagination ──
export const DEFAULT_PAGE_SIZE = 50

// ── Dataverse OData Headers ──
export const ODATA_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'OData-MaxVersion': '4.0',
  'OData-Version': '4.0',
} as const

// ── Lead Source Codes (Dataverse optionset) ──
export const LEAD_SOURCE_OPTIONS = [
  { value: 1, label: 'Advertisement' },
  { value: 2, label: 'Employee Referral' },
  { value: 3, label: 'External Referral' },
  { value: 4, label: 'Partner' },
  { value: 5, label: 'Public Relations' },
  { value: 6, label: 'Seminar' },
  { value: 7, label: 'Trade Show' },
  { value: 8, label: 'Web' },
  { value: 9, label: 'Word of Mouth' },
  { value: 10, label: 'Other' },
] as const

// ── Lead Status Codes ──
export const LEAD_STATUS = {
  NEU: 1,
  IN_ARBEIT: 2,
  GEWONNEN: 3,
  VERLOREN: 4,
} as const

export const LEAD_STATUS_LABELS: Record<number, string> = {
  1: 'Neu',
  2: 'In Arbeit',
  3: 'Gewonnen',
  4: 'Verloren',
}

// ── Opportunity Phases ──
export const OPPORTUNITY_PHASES = {
  NEU: 1,
  IN_VERHANDLUNG: 2,
  ANGEBOT: 3,
  GEWONNEN: 4,
} as const

export const OPPORTUNITY_PHASE_LABELS: Record<number, string> = {
  1: 'Neu',
  2: 'In Verhandlung',
  3: 'Angebot',
  4: 'Gewonnen',
}

export const OPPORTUNITY_STATUS = {
  OPEN: 1,
  WON: 2,
  LOST: 3,
} as const

// ── Task Priority ──
export const TASK_PRIORITY = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
} as const

// ── Follow-up Channels ──
export const FOLLOWUP_CHANNELS = ['call', 'email', 'meeting', 'other'] as const
export type FollowUpChannel = (typeof FOLLOWUP_CHANNELS)[number]

// ── Nav Routes ──
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  LEADS: '/dashboard/leads',
  LEADS_NEW: '/dashboard/leads/new',
  LEAD_DETAIL: (id: string) => `/dashboard/leads/${id}`,
  OPPORTUNITIES: '/dashboard/opportunities',
  OPPORTUNITY_DETAIL: (id: string) => `/dashboard/opportunities/${id}` as const,
  FOLLOW_UPS: '/dashboard/follow-ups',
  SETTINGS: '/dashboard/settings',
} as const
