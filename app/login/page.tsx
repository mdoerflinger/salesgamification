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

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-4 pb-2">
          <NavaxLogo variant="brand" width={120} />
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
