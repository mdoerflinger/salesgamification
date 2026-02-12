'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/use-auth'
import { NavaxLogo } from '@/components/ds/navax-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/config/constants'
import { useEffect, useState } from 'react'
import { DEMO_USERS } from '@/lib/auth/mock-auth'
import { User } from 'lucide-react'

export default function LoginPage() {
  const { signIn, isAuthenticated, isLoading, isConfigured, useMockAuth } = useAuth()
  const router = useRouter()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(ROUTES.DASHBOARD)
    }
  }, [isAuthenticated, router])

  const handleSignIn = async (userId?: string) => {
    setIsSigningIn(true)
    setError(null)
    try {
      await signIn(userId)
      router.replace(ROUTES.DASHBOARD)
    } catch (err) {
      console.error('[Login] Sign in error:', err)
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to sign in. Please check your environment configuration.'
      )
      setIsSigningIn(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Demo mode - show user selection
  if (useMockAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="flex flex-col items-center gap-4 pb-4">
            <NavaxLogo variant="brand" width={180} />
            <div className="text-center">
              <CardTitle className="text-2xl font-heading">Sales Lead Coach</CardTitle>
              <CardDescription className="mt-2">
                Demo-Modus: Wählen Sie einen Benutzer aus
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            
            <div className="grid gap-3">
              {DEMO_USERS.map((user) => (
                <Button
                  key={user.id}
                  onClick={() => handleSignIn(user.id)}
                  disabled={isSigningIn}
                  variant="outline"
                  className="h-auto flex items-start justify-start gap-4 p-4 hover:bg-accent hover:border-primary"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-base">{user.displayName}</div>
                    <div className="text-sm text-muted-foreground">{user.role}</div>
                    <div className="text-xs text-muted-foreground mt-1">{user.email}</div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="mt-2 rounded-md bg-blue-500/10 border border-blue-500/20 p-3">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                <strong>Demo-Modus:</strong> Für echte Dynamics 365-Anbindung setzen Sie NEXT_PUBLIC_USE_MOCK_AUTH=false
                und konfigurieren Sie die Microsoft Entra ID Umgebungsvariablen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Real authentication mode
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-4 pb-2">
          <NavaxLogo variant="brand" width={180} />
          <div className="text-center">
            <CardTitle className="text-xl font-heading">Sales Lead Coach</CardTitle>
            <CardDescription className="mt-1">
              Melden Sie sich mit Ihrem Microsoft-Konto an
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Button
            onClick={() => handleSignIn()}
            disabled={isSigningIn}
            className="w-full"
            size="lg"
          >
            {isSigningIn ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Anmelden...
              </>
            ) : (
              <>
                <svg viewBox="0 0 21 21" className="mr-2 h-5 w-5" aria-hidden="true">
                  <rect x="1" y="1" width="9" height="9" fill="hsl(var(--primary-foreground))" />
                  <rect x="11" y="1" width="9" height="9" fill="hsl(var(--primary-foreground))" />
                  <rect x="1" y="11" width="9" height="9" fill="hsl(var(--primary-foreground))" />
                  <rect x="11" y="11" width="9" height="9" fill="hsl(var(--primary-foreground))" />
                </svg>
                Mit Microsoft anmelden
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Verbindet sich mit Dynamics 365
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
