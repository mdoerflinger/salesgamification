/**
 * Lead business logic layer.
 */
import type { LeadCreateDto, LeadEntity } from '@/types/dataverse'
import type { LeadHealth } from '@/types'
import { computeLeadHealth } from '@/lib/dataverse/mappers'

/**
 * Auto-compute fullname from first + last name if not already set.
 */
export function enrichLeadPayload(dto: LeadCreateDto): LeadCreateDto {
  const enriched = { ...dto }

  if (!enriched.subject && enriched.companyname) {
    enriched.subject = `Lead: ${enriched.companyname}`
    if (enriched.firstname || enriched.lastname) {
      enriched.subject = `${[enriched.firstname, enriched.lastname].filter(Boolean).join(' ')} - ${enriched.companyname}`
    }
  }

  return enriched
}

/**
 * Get health for a list of leads.
 */
export function computeLeadsHealth(
  leads: LeadEntity[],
  leadsWithFollowUps: Set<string>
): LeadHealth[] {
  return leads.map((lead) =>
    computeLeadHealth(lead, leadsWithFollowUps.has(lead.leadid))
  )
}

/**
 * Determine essential fields for quick add.
 */
export const QUICK_ADD_FIELDS = [
  'firstname',
  'lastname',
  'companyname',
  'emailaddress1',
  'mobilephone',
] as const
