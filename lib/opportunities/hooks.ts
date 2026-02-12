'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { useMemo } from 'react'
import { DataverseClient } from '@/lib/dataverse/client'
import { MockDataverseClient } from '@/lib/dataverse/mock-client'
import { useAuth } from '@/lib/auth/use-auth'
import { enrichOpportunityPayload } from './service'
import type { OpportunityCreateDto, OpportunityUpdateDto } from '@/types/dataverse'

function useDataverseClient() {
  const { acquireToken, useMockAuth } = useAuth()

  return useMemo(() => {
    if (useMockAuth) {
      return new MockDataverseClient() as unknown as DataverseClient
    }
    return new DataverseClient(acquireToken)
  }, [acquireToken, useMockAuth])
}

/**
 * Fetch all opportunities with optional search/filter.
 */
export function useOpportunities(opts?: { search?: string; filter?: string }) {
  const client = useDataverseClient()
  const key = ['opportunities', opts?.search, opts?.filter].filter(Boolean).join(':')

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await client.getOpportunities({
        search: opts?.search,
        filter: opts?.filter,
      })
      return response.value
    },
    { revalidateOnFocus: false }
  )

  return {
    opportunities: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  }
}

/**
 * Fetch a single opportunity by ID.
 */
export function useOpportunityDetail(id: string | undefined) {
  const client = useDataverseClient()

  const { data, error, isLoading, mutate } = useSWR(
    id ? `opportunity:${id}` : null,
    async () => {
      if (!id) return null
      return client.getOpportunity(id)
    },
    { revalidateOnFocus: false }
  )

  return {
    opportunity: data ?? null,
    isLoading,
    error,
    refresh: mutate,
  }
}

/**
 * Create a new opportunity (mutation hook).
 */
export function useCreateOpportunity() {
  const client = useDataverseClient()

  const { trigger, isMutating, error } = useSWRMutation(
    'opportunities',
    async (_key: string, { arg }: { arg: OpportunityCreateDto }) => {
      const enriched = enrichOpportunityPayload(arg)
      return client.createOpportunity(enriched)
    }
  )

  return {
    createOpportunity: trigger,
    isCreating: isMutating,
    error,
  }
}

/**
 * Update an opportunity (mutation hook).
 */
export function useUpdateOpportunity() {
  const client = useDataverseClient()

  const { trigger, isMutating, error } = useSWRMutation(
    'opportunities:update',
    async (
      _key: string,
      { arg }: { arg: { id: string; patch: OpportunityUpdateDto } }
    ) => {
      await client.updateOpportunity(arg.id, arg.patch)
    }
  )

  return {
    updateOpportunity: trigger,
    isUpdating: isMutating,
    error,
  }
}

/**
 * Advance opportunity to the next phase (mutation hook).
 */
export function useAdvanceOpportunityPhase() {
  const client = useDataverseClient()

  const { trigger, isMutating, error } = useSWRMutation(
    'opportunities:advance-phase',
    async (
      _key: string,
      { arg }: { arg: { id: string; phase: number } }
    ) => {
      await client.setOpportunityPhase(arg.id, arg.phase)
    }
  )

  return {
    advancePhase: trigger,
    isAdvancing: isMutating,
    error,
  }
}

/**
 * Close opportunity as lost (mutation hook).
 */
export function useCloseOpportunityAsLost() {
  const client = useDataverseClient()

  const { trigger, isMutating, error } = useSWRMutation(
    'opportunities:close-lost',
    async (_key: string, { arg }: { arg: { id: string } }) => {
      await client.closeOpportunityAsLost(arg.id)
    }
  )

  return {
    closeAsLost: trigger,
    isClosing: isMutating,
    error,
  }
}

/**
 * Create an opportunity from a lead (when lead status is set to "Gewonnen").
 */
export function useCreateOpportunityFromLead() {
  const client = useDataverseClient()

  const { trigger, isMutating, error } = useSWRMutation(
    'opportunities:from-lead',
    async (_key: string, { arg }: { arg: { leadId: string } }) => {
      // The mock client has a dedicated method for this
      const mockClient = client as unknown as MockDataverseClient
      if (typeof mockClient.createOpportunityFromLead === 'function') {
        return mockClient.createOpportunityFromLead(arg.leadId)
      }
      // For real client, create opportunity manually
      throw new Error('createOpportunityFromLead not available on real client')
    }
  )

  return {
    createFromLead: trigger,
    isCreating: isMutating,
    error,
  }
}
