'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { useCallback, useMemo } from 'react'
import { DataverseClient } from '@/lib/dataverse/client'
import { MockDataverseClient } from '@/lib/dataverse/mock-client'
import { useAuth } from '@/lib/auth/use-auth'
import { enrichLeadPayload } from './service'
import type { LeadCreateDto, LeadUpdateDto, LeadEntity } from '@/types/dataverse'

function useDataverseClient() {
  const { acquireToken, useMockAuth } = useAuth()
  
  return useMemo(() => {
    if (useMockAuth) {
      console.log('[v0] Using MockDataverseClient')
      return new MockDataverseClient() as unknown as DataverseClient
    }
    console.log('[v0] Using real DataverseClient')
    return new DataverseClient(acquireToken)
  }, [acquireToken, useMockAuth])
}

/**
 * Fetch all leads with optional search/filter.
 */
export function useLeads(opts?: { search?: string; filter?: string }) {
  const client = useDataverseClient()
  const key = ['leads', opts?.search, opts?.filter].filter(Boolean).join(':')

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await client.getLeads({
        search: opts?.search,
        filter: opts?.filter,
      })
      return response.value
    },
    { revalidateOnFocus: false }
  )

  return {
    leads: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  }
}

/**
 * Fetch a single lead by ID.
 */
export function useLeadDetail(id: string | undefined) {
  const client = useDataverseClient()

  const { data, error, isLoading, mutate } = useSWR(
    id ? `lead:${id}` : null,
    async () => {
      if (!id) return null
      return client.getLead(id)
    },
    { revalidateOnFocus: false }
  )

  return {
    lead: data ?? null,
    isLoading,
    error,
    refresh: mutate,
  }
}

/**
 * Create a new lead (mutation hook).
 */
export function useCreateLead() {
  const client = useDataverseClient()

  const { trigger, isMutating, error } = useSWRMutation(
    'leads',
    async (_key: string, { arg }: { arg: LeadCreateDto }) => {
      const enriched = enrichLeadPayload(arg)
      return client.createLead(enriched)
    }
  )

  return {
    createLead: trigger,
    isCreating: isMutating,
    error,
  }
}

/**
 * Update a lead (mutation hook).
 */
export function useUpdateLead() {
  const client = useDataverseClient()

  const { trigger, isMutating, error } = useSWRMutation(
    'leads:update',
    async (_key: string, { arg }: { arg: { id: string; patch: LeadUpdateDto } }) => {
      await client.updateLead(arg.id, arg.patch)
    }
  )

  return {
    updateLead: trigger,
    isUpdating: isMutating,
    error,
  }
}
