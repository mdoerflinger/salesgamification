/**
 * Mappers to transform Dataverse API responses into domain models.
 */
import type { LeadEntity, TaskEntity, ActivityEntity } from '@/types/dataverse'
import type { LeadHealth, HealthIssue, FollowUpItem, FollowUpGroup } from '@/types'
import { STALE_LEAD_DAYS } from '@/lib/config/constants'

/**
 * Compute display name from lead entity.
 */
export function getLeadDisplayName(lead: LeadEntity): string {
  if (lead.fullname) return lead.fullname
  const parts = [lead.firstname, lead.lastname].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : lead.companyname || 'Unnamed Lead'
}

/**
 * Compute health issues for a lead.
 */
export function computeLeadHealth(lead: LeadEntity, hasFollowUp: boolean): LeadHealth {
  const issues: HealthIssue[] = []

  if (!lead.emailaddress1) issues.push('missing_email')
  if (!lead.mobilephone && !lead.telephone1) issues.push('missing_phone')
  if (!lead.companyname) issues.push('missing_company')
  if (!lead.firstname && !lead.lastname) issues.push('missing_contact_name')
  if (!hasFollowUp) issues.push('no_next_step')

  // Stale check
  const lastModified = new Date(lead.modifiedon)
  const daysSinceModified = Math.floor(
    (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysSinceModified > STALE_LEAD_DAYS) issues.push('stale')

  // Score: start at 100, subtract for each issue
  const deductions: Record<HealthIssue, number> = {
    missing_email: 15,
    missing_phone: 10,
    no_next_step: 25,
    stale: 20,
    missing_company: 15,
    missing_contact_name: 15,
  }

  const score = Math.max(
    0,
    issues.reduce((acc, issue) => acc - deductions[issue], 100)
  )

  return { leadId: lead.leadid, issues, score }
}

/**
 * Map a task entity to a follow-up item.
 */
export function mapTaskToFollowUp(
  task: TaskEntity,
  leadName: string,
  companyName?: string
): FollowUpItem {
  const scheduledDate = task.scheduledend || task.scheduledstart || task.createdon
  const group = getFollowUpGroup(scheduledDate)

  return {
    id: task.activityid,
    subject: task.subject,
    leadId: task._regardingobjectid_value || '',
    leadName,
    companyName,
    scheduledDate,
    priority: task.prioritycode,
    status: task.statecode,
    group,
  }
}

/**
 * Determine which follow-up group a date falls into.
 */
export function getFollowUpGroup(dateStr: string): FollowUpGroup {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()))

  if (date < today) return 'overdue'
  if (date < new Date(today.getTime() + 24 * 60 * 60 * 1000)) return 'today'
  if (date < endOfWeek) return 'this_week'
  return 'later'
}

/**
 * Get human-readable label for lead status code.
 */
export function getLeadStatusLabel(statusCode: number): string {
  const labels: Record<number, string> = {
    1: 'New',
    2: 'Contacted',
    3: 'Qualified',
    4: 'Lost',
    5: 'Cannot Contact',
    6: 'No Longer Interested',
    7: 'Canceled',
  }
  return labels[statusCode] || 'Unknown'
}

/**
 * Get status badge variant for a lead status.
 */
export function getLeadStatusVariant(
  statusCode: number
): 'default' | 'success' | 'warning' | 'destructive' | 'muted' {
  if (statusCode === 3) return 'success'
  if (statusCode === 2) return 'default'
  if (statusCode === 1) return 'warning'
  if (statusCode >= 4) return 'destructive'
  return 'muted'
}
