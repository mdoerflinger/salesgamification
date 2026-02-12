/**
 * Opportunity business logic layer.
 */
import type { OpportunityCreateDto, LeadEntity } from '@/types/dataverse'
import { OPPORTUNITY_PHASES } from '@/lib/config/constants'

/**
 * Create an OpportunityCreateDto from a Lead entity (when Lead is set to "Gewonnen").
 */
export function createOpportunityFromLead(lead: LeadEntity): OpportunityCreateDto {
  const name =
    lead.subject || `Opportunity - ${lead.fullname || lead.companyname || 'Unbenannt'}`

  return {
    name,
    description: lead.description,
    estimatedvalue: lead.revenue,
    phase: OPPORTUNITY_PHASES.NEU,
    'originatingleadid@odata.bind': `/leads(${lead.leadid})`,
  }
}

/**
 * Validate that a phase transition is allowed.
 * Only forward transitions are allowed (1->2->3->4), no skipping.
 */
export function isValidPhaseTransition(
  currentPhase: number,
  targetPhase: number
): boolean {
  return targetPhase === currentPhase + 1
}

/**
 * Enrich an opportunity payload with defaults.
 */
export function enrichOpportunityPayload(
  dto: OpportunityCreateDto
): OpportunityCreateDto {
  return {
    ...dto,
    phase: dto.phase ?? OPPORTUNITY_PHASES.NEU,
  }
}
