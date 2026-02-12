'use client'

import { AuthGuard } from '@/lib/auth/auth-guard'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { XPAwardBanner } from '@/components/gamification/xp-award-banner'
import { Celebration } from '@/components/gamification/celebration'
import { useGamification } from '@/lib/gamification/use-gamification'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { celebration, clearCelebration } = useGamification()

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-muted/40 text-foreground">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <XPAwardBanner />
        {celebration && (
          <Celebration
            type={celebration.type}
            title={celebration.title}
            description={celebration.description}
            show={!!celebration}
            onComplete={clearCelebration}
          />
        )}
      </div>
    </AuthGuard>
  )
}
