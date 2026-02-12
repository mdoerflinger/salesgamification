'use client'

import * as React from 'react'
import type { AuthUser } from '@/types'
import { env } from '@/lib/config/env'
import { mockAuth } from './mock-auth'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (userId?: string) => Promise<void>
  signOut: () => Promise<void>
  acquireToken: () => Promise<string>
  isConfigured: boolean
  useMockAuth: boolean
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function useAuthContext() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const msalInstanceRef = React.useRef<unknown>(null)
  const useMock = env.useMockAuth()
  
  // Check if real auth is properly configured
  const isConfigured = React.useMemo(() => {
    if (useMock) return true // Mock mode is always "configured"
    return !!(env.clientId() && env.tenantId() && env.dataverseResource())
  }, [useMock])

  // Initialize on mount
  React.useEffect(() => {
    async function init() {
      if (useMock) {
        // Mock mode - don't auto sign-in, wait for user action
        setIsLoading(false)
        return
      }

      // Check if required env vars are present
      if (!env.clientId() || !env.tenantId() || !env.dataverseResource()) {
        console.warn(
          '[Auth] Environment variables not configured. Set NEXT_PUBLIC_CLIENT_ID, NEXT_PUBLIC_TENANT_ID, and NEXT_PUBLIC_DATAVERSE_RESOURCE, or enable mock mode with NEXT_PUBLIC_USE_MOCK_AUTH=true'
        )
        setIsLoading(false)
        return
      }

      try {
        const { PublicClientApplication } = await import('@azure/msal-browser')
        const { getMsalConfig } = await import('./msal-config')
        const msalInstance = new PublicClientApplication(getMsalConfig())
        await msalInstance.initialize()
        msalInstanceRef.current = msalInstance

        const response = await msalInstance.handleRedirectPromise()
        if (response?.account) {
          setUser({
            id: response.account.localAccountId,
            displayName: response.account.name || response.account.username,
            email: response.account.username,
          })
        } else {
          const accounts = msalInstance.getAllAccounts()
          if (accounts.length > 0) {
            setUser({
              id: accounts[0].localAccountId,
              displayName: accounts[0].name || accounts[0].username,
              email: accounts[0].username,
            })
          }
        }
      } catch (err) {
        console.error('[Auth] MSAL initialization error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [useMock])

  const signIn = React.useCallback(async (userId?: string) => {
    console.log('[v0] AuthProvider.signIn called, useMock:', useMock, 'userId:', userId)
    if (useMock) {
      console.log('[v0] Using mock auth...')
      const mockUser = await mockAuth.signIn(userId)
      console.log('[v0] Mock user received:', mockUser)
      setUser(mockUser)
      console.log('[v0] User state updated')
      return
    }

    const msalInstance = msalInstanceRef.current as {
      loginRedirect: (req: unknown) => Promise<void>
    } | null
    if (!msalInstance) {
      console.error('[Auth] MSAL instance not initialized. Cannot sign in.')
      throw new Error('Authentication not initialized')
    }
    const { getLoginRequest } = await import('./msal-config')
    await msalInstance.loginRedirect(getLoginRequest())
  }, [useMock])

  const signOut = React.useCallback(async () => {
    if (useMock) {
      await mockAuth.signOut()
      setUser(null)
      return
    }

    const msalInstance = msalInstanceRef.current as {
      logoutRedirect: () => Promise<void>
    } | null
    if (!msalInstance) return
    await msalInstance.logoutRedirect()
    setUser(null)
  }, [useMock])

  const acquireToken = React.useCallback(async (): Promise<string> => {
    if (useMock) {
      return mockAuth.acquireTokenSilent()
    }

    const msalInstance = msalInstanceRef.current as {
      acquireTokenSilent: (req: unknown) => Promise<{ accessToken: string }>
      acquireTokenPopup: (req: unknown) => Promise<{ accessToken: string }>
      getAllAccounts: () => Array<{ localAccountId: string }>
    } | null
    if (!msalInstance) {
      console.error('[Auth] MSAL instance not initialized')
      throw new Error('MSAL not initialized')
    }
    const { getTokenRequest } = await import('./msal-config')
    const accounts = msalInstance.getAllAccounts()
    if (accounts.length === 0) {
      console.error('[Auth] No authenticated account found')
      throw new Error('No authenticated account')
    }

    try {
      const response = await msalInstance.acquireTokenSilent({
        ...getTokenRequest(),
        account: accounts[0],
      })
      return response.accessToken
    } catch (error) {
      console.error('[Auth] Silent token acquisition failed, trying popup:', error)
      // Fallback to popup if silent fails
      const response = await msalInstance.acquireTokenPopup({
        ...getTokenRequest(),
        account: accounts[0],
      })
      return response.accessToken
    }
  }, [useMock])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signOut,
      acquireToken,
      isConfigured,
      useMockAuth: useMock,
    }),
    [user, isLoading, signIn, signOut, acquireToken, isConfigured, useMock]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
