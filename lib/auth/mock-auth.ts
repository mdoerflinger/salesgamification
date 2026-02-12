/**
 * Mock auth provider for local development without Entra ID.
 * Returns fake tokens and user info.
 */
import type { AuthUser } from '@/types'

const MOCK_USER: AuthUser = {
  id: 'mock-user-001',
  displayName: 'Demo User',
  email: 'demo@salesleadcoach.dev',
  avatar: undefined,
}

const MOCK_TOKEN = 'mock-access-token-for-development'

let _isAuthenticated = false
let _currentUser: AuthUser | null = null

export const mockAuth = {
  signIn: async (): Promise<AuthUser> => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500))
    _isAuthenticated = true
    _currentUser = MOCK_USER
    return MOCK_USER
  },

  signOut: async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 200))
    _isAuthenticated = false
    _currentUser = null
  },

  acquireTokenSilent: async (): Promise<string> => {
    if (!_isAuthenticated) {
      throw new Error('Not authenticated')
    }
    return MOCK_TOKEN
  },

  getAccount: (): AuthUser | null => {
    return _currentUser
  },

  isAuthenticated: (): boolean => {
    return _isAuthenticated
  },
}
