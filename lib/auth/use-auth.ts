'use client'

import { useAuthContext } from './auth-provider'

/**
 * Convenience hook for authentication.
 * Wraps AuthProvider context.
 */
export function useAuth() {
  return useAuthContext()
}
