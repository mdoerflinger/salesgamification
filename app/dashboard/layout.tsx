'use client'

import { AuthGuard } from '@/lib/auth/auth-guard'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { XPAwardBanner } from '@/components/gamification/xp-award-banner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
      </div>
    </AuthGuard>
  )
}
