'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Target,
  CalendarCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Trophy,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NavaxLogo } from '@/components/ds/navax-logo'
import { useAuth } from '@/lib/auth/use-auth'
import { useGamification } from '@/lib/gamification/use-gamification'
import { ROUTES } from '@/lib/config/constants'

const NAV_ITEMS = [
  { label: 'Today', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Leads', href: ROUTES.LEADS, icon: Users },
  { label: 'Opportunities', href: ROUTES.OPPORTUNITIES, icon: Target },
  { label: 'Follow-ups', href: ROUTES.FOLLOW_UPS, icon: CalendarCheck },
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = React.useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { level, streakDays } = useGamification()

  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
        {!collapsed && (
          <Link href={ROUTES.DASHBOARD} className="shrink-0">
            <NavaxLogo variant="brand" width={100} />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* XP/Streak quick stats */}
      {!collapsed && (
        <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-sidebar-foreground/70">
            <Trophy className="h-3.5 w-3.5 text-warning" />
            <span>Lvl {level}</span>
          </div>
          {streakDays > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-sidebar-foreground/70">
              <Flame className="h-3.5 w-3.5 text-destructive" />
              <span>{streakDays}d streak</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Dashboard navigation">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent',
                    active && 'bg-sidebar-accent text-sidebar-primary',
                    collapsed && 'justify-center px-0'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user?.displayName
              ?.split(' ')
              .map((n) => n[0])
              .join('') || 'U'}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {user?.displayName || 'User'}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  {user?.email || ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                onClick={signOut}
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
