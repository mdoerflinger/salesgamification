/**
 * Mock auth provider for local development without Entra ID.
 * Returns fake tokens and user info.
 * Persists auth state in a cookie so it survives navigation/SSR.
 */
import type { AuthUser } from '@/types'

export interface DemoUser extends AuthUser {
  role: string
  description: string
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-user-001',
    displayName: 'Sarah Schmidt',
    email: 'sarah.schmidt@navax.de',
    role: 'Sales Manager',
    description: 'Vertriebsleiterin mit vollem Zugriff',
  },
  {
    id: 'demo-user-002',
    displayName: 'Michael Weber',
    email: 'michael.weber@navax.de',
    role: 'Account Executive',
    description: 'Senior Vertriebsmitarbeiter',
  },
  {
    id: 'demo-user-003',
    displayName: 'Anna Müller',
    email: 'anna.mueller@navax.de',
    role: 'Junior Sales Rep',
    description: 'Junior Vertriebsmitarbeiterin',
  },
]

const MOCK_TOKEN = 'mock-access-token-for-development'
const COOKIE_KEY = 'mock-auth-user'

function setCookie(key: string, value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${key}=${encodeURIComponent(value)};path=/;max-age=${60 * 60 * 24 * 7};SameSite=Lax`
}

function getCookie(key: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(key: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${key}=;path=/;max-age=0`
}

/**
 * Restores the mock auth user from the cookie.
 * Returns null if no valid session exists.
 */
function restoreUser(): AuthUser | null {
  const raw = getCookie(COOKIE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as AuthUser
    if (parsed && parsed.id && parsed.email) {
      return parsed
    }
  } catch {
    deleteCookie(COOKIE_KEY)
  }
  return null
}

export const mockAuth = {
  signIn: async (userId?: string): Promise<AuthUser> => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500))
    
    // Find the user by ID or use the first one
    const user = userId 
      ? DEMO_USERS.find(u => u.id === userId) || DEMO_USERS[0]
      : DEMO_USERS[0]
    
    // Persist to cookie
    setCookie(COOKIE_KEY, JSON.stringify(user))
    return user
  },

  signOut: async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 200))
    deleteCookie(COOKIE_KEY)
  },

  acquireTokenSilent: async (): Promise<string> => {
    const user = restoreUser()
    if (!user) {
      throw new Error('Not authenticated')
    }
    return MOCK_TOKEN
  },

  getAccount: (): AuthUser | null => {
    return restoreUser()
  },

  isAuthenticated: (): boolean => {
    return !!restoreUser()
  },
  
  getDemoUsers: (): DemoUser[] => {
    return DEMO_USERS
  },

  /**
   * Restores the user from the cookie (used by AuthProvider on mount).
   */
  restoreSession: (): AuthUser | null => {
    return restoreUser()
  },
}
