/**
 * Mock auth provider for local development without Entra ID.
 * Returns fake tokens and user info.
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

let _isAuthenticated = false
let _currentUser: AuthUser | null = null

export const mockAuth = {
  signIn: async (userId?: string): Promise<AuthUser> => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500))
    
    // Find the user by ID or use the first one
    const user = userId 
      ? DEMO_USERS.find(u => u.id === userId) || DEMO_USERS[0]
      : DEMO_USERS[0]
    
    _isAuthenticated = true
    _currentUser = user
    return user
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
  
  getDemoUsers: (): DemoUser[] => {
    return DEMO_USERS
  },
}
