/**
 * App-wide constants for the Sales Lead Coach.
 */

// ── XP Values ──
export const XP_CREATE_LEAD = 10
export const XP_FOLLOWUP_ONTIME = 5
export const XP_FIX_MISSING_FIELD = 3
export const XP_DAILY_STREAK = 1

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
  NEW: 1,
  CONTACTED: 2,
  QUALIFIED: 3,
  LOST: 4,
  CANNOT_CONTACT: 5,
  NO_LONGER_INTERESTED: 6,
  CANCELED: 7,
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
  FOLLOW_UPS: '/dashboard/follow-ups',
  SETTINGS: '/dashboard/settings',
} as const
