'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { useMemo } from 'react'
import { DataverseClient } from '@/lib/dataverse/client'
import { useAuth } from '@/lib/auth/use-auth'
import { mapTaskToFollowUp } from '@/lib/dataverse/mappers'
import type { TaskCreateDto } from '@/types/dataverse'
import type { FollowUpItem } from '@/types'

function useDataverseClient() {
  const { acquireToken } = useAuth()
  return useMemo(() => new DataverseClient(acquireToken), [acquireToken])
}

/**
 * Fetch activities for a specific lead.
 */
export function useLeadActivities(leadId: string | undefined) {
  const client = useDataverseClient()

  const { data, error, isLoading, mutate } = useSWR(
    leadId ? `activities:${leadId}` : null,
    async () => {
      if (!leadId) return []
      const response = await client.listLeadActivities(leadId)
      return response.value
    },
    { revalidateOnFocus: false }
  )

  return {
    activities: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  }
}

/**
 * Fetch tasks (follow-ups) for a specific lead.
 */
export function useLeadFollowUps(leadId: string | undefined) {
  const client = useDataverseClient()

  const { data, error, isLoading, mutate } = useSWR(
    leadId ? `followups:${leadId}` : null,
    async () => {
      if (!leadId) return []
      const response = await client.getLeadTasks(leadId)
      return response.value.map((task) =>
        mapTaskToFollowUp(task, '', undefined)
      )
    },
    { revalidateOnFocus: false }
  )

  return {
    followUps: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  }
}

/**
 * Create a follow-up task bound to a lead.
 */
export function useCreateFollowUp() {
  const client = useDataverseClient()

  const { trigger, isMutating, error } = useSWRMutation(
    'followups:create',
    async (
      _key: string,
      { arg }: { arg: { leadId: string; dto: TaskCreateDto } }
    ) => {
      return client.createTaskFollowUp(arg.leadId, arg.dto)
    }
  )

  return {
    createFollowUp: trigger,
    isCreating: isMutating,
    error,
  }
}

/**
 * Complete a follow-up task.
 */
export function useCompleteFollowUp() {
  const client = useDataverseClient()

  const { trigger, isMutating, error } = useSWRMutation(
    'followups:complete',
    async (_key: string, { arg }: { arg: string }) => {
      await client.completeTask(arg)
    }
  )

  return {
    completeFollowUp: trigger,
    isCompleting: isMutating,
    error,
  }
}
