'use client'

import * as React from 'react'
import type { AuthUser } from '@/types'
import { env } from '@/lib/config/env'
import { mockAuth } from './mock-auth'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  acquireToken: () => Promise<string>
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

  // Initialize on mount
  React.useEffect(() => {
    async function init() {
      if (useMock) {
        // Auto sign-in in mock mode for convenience
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
        console.error('MSAL initialization error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [useMock])

  const signIn = React.useCallback(async () => {
    if (useMock) {
      const mockUser = await mockAuth.signIn()
      setUser(mockUser)
      return
    }

    const msalInstance = msalInstanceRef.current as {
      loginRedirect: (req: unknown) => Promise<void>
    } | null
    if (!msalInstance) return
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
      getAllAccounts: () => Array<{ localAccountId: string }>
    } | null
    if (!msalInstance) throw new Error('MSAL not initialized')
    const { getTokenRequest } = await import('./msal-config')
    const accounts = msalInstance.getAllAccounts()
    if (accounts.length === 0) throw new Error('No authenticated account')

    const response = await msalInstance.acquireTokenSilent({
      ...getTokenRequest(),
      account: accounts[0],
    })
    return response.accessToken
  }, [useMock])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signOut,
      acquireToken,
    }),
    [user, isLoading, signIn, signOut, acquireToken]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
