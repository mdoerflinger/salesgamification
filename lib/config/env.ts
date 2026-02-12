/**
 * Typed environment variable access with runtime validation.
 */

function required(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function optional(key: string, fallback = ''): string {
  return process.env[key] || fallback
}

function bool(key: string, fallback = false): boolean {
  const v = process.env[key]
  if (!v) return fallback
  return v === 'true' || v === '1'
}

export const env = {
  // Entra ID / MSAL
  tenantId: () => optional('NEXT_PUBLIC_TENANT_ID'),
  clientId: () => optional('NEXT_PUBLIC_CLIENT_ID'),
  authority: () =>
    optional(
      'NEXT_PUBLIC_AUTHORITY',
      `https://login.microsoftonline.com/${optional('NEXT_PUBLIC_TENANT_ID', 'common')}`
    ),

  // Dataverse
  dataverseResource: () => optional('NEXT_PUBLIC_DATAVERSE_RESOURCE'),
  dataverseScope: () =>
    optional(
      'NEXT_PUBLIC_DATAVERSE_SCOPE',
      `${optional('NEXT_PUBLIC_DATAVERSE_RESOURCE')}/.default`
    ),
  dataverseBaseUrl: () =>
    `${optional('NEXT_PUBLIC_DATAVERSE_RESOURCE')}/api/data/v9.2`,

  // Azure Speech
  speechKey: () => optional('NEXT_PUBLIC_SPEECH_KEY'),
  speechRegion: () => optional('NEXT_PUBLIC_SPEECH_REGION'),

  // Feature flags
  useMockAuth: () => bool('NEXT_PUBLIC_USE_MOCK_AUTH', true),
  useMockVoice: () => bool('NEXT_PUBLIC_USE_MOCK_VOICE', true),
} as const
