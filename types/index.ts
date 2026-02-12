/**
 * Shared types for the Sales Lead Coach.
 */

export * from './dataverse'
export * from './gamification'

// ── Auth ──

export interface AuthUser {
  id: string
  displayName: string
  email: string
  avatar?: string
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ── Voice ──

export type VoiceIntentType = 'create_lead' | 'add_note' | 'schedule_followup' | 'change_opportunity_phase' | 'unknown'

export interface VoiceIntent {
  type: VoiceIntentType
  confidence: number
  data: Record<string, string>
  rawTranscript: string
}

export interface VoiceState {
  isListening: boolean
  transcript: string
  interimTranscript: string
  intent: VoiceIntent | null
  error: string | null
}

// ── Sync ──

export interface SyncQueueItem {
  id: string
  operation: 'create' | 'update' | 'delete'
  entityType: string
  entityId?: string
  payload: Record<string, unknown>
  timestamp: string
  retries: number
  status: 'pending' | 'in_progress' | 'failed' | 'completed'
}

export type ConflictResolution = 'client_wins' | 'server_wins' | 'manual'

// ── Lead Health ──

export type HealthIssue =
  | 'missing_email'
  | 'missing_phone'
  | 'no_next_step'
  | 'stale'
  | 'missing_company'
  | 'missing_contact_name'

export interface LeadHealth {
  leadId: string
  issues: HealthIssue[]
  score: number // 0-100
}

// ── Follow-up View ──

export type FollowUpGroup = 'overdue' | 'today' | 'this_week' | 'later'

export interface FollowUpItem {
  id: string
  subject: string
  leadId: string
  leadName: string
  companyName?: string
  scheduledDate: string
  priority: number
  status: number
  group: FollowUpGroup
}

// ── Navigation ──

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: string | number
}
