/**
 * MSAL Browser configuration for Microsoft Entra ID authentication.
 * Uses Authorization Code flow with PKCE.
 */
import type { Configuration, RedirectRequest } from '@azure/msal-browser'
import { env } from '@/lib/config/env'

export function getMsalConfig(): Configuration {
  return {
    auth: {
      clientId: env.clientId(),
      authority: env.authority(),
      redirectUri: typeof window !== 'undefined' ? window.location.origin : '/',
      postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : '/',
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: 'sessionStorage',
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        logLevel: 3, // Error
        piiLoggingEnabled: false,
      },
    },
  }
}

export function getLoginRequest(): RedirectRequest {
  return {
    scopes: [env.dataverseScope()],
    prompt: 'select_account',
  }
}

export function getTokenRequest() {
  return {
    scopes: [env.dataverseScope()],
  }
}
