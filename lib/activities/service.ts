/**
 * Activity / Follow-up business logic.
 */
import type { TaskEntity } from '@/types/dataverse'
import type { FollowUpItem, FollowUpGroup } from '@/types'
import { mapTaskToFollowUp } from '@/lib/dataverse/mappers'

/**
 * Group follow-up items by their time bucket.
 */
export function groupFollowUps(
  items: FollowUpItem[]
): Record<FollowUpGroup, FollowUpItem[]> {
  const groups: Record<FollowUpGroup, FollowUpItem[]> = {
    overdue: [],
    today: [],
    this_week: [],
    later: [],
  }

  for (const item of items) {
    groups[item.group].push(item)
  }

  return groups
}

/**
 * Get follow-up display labels.
 */
export const FOLLOW_UP_GROUP_LABELS: Record<FollowUpGroup, string> = {
  overdue: 'Overdue',
  today: 'Today',
  this_week: 'This Week',
  later: 'Later',
}

/**
 * Compute default due date for a new follow-up (tomorrow at 9 AM).
 */
export function getDefaultDueDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(9, 0, 0, 0)
  return date.toISOString()
}
