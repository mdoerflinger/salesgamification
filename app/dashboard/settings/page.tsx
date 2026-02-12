'use client'

import { PageHeader } from '@/components/ds/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth/use-auth'
import { useGamification } from '@/lib/gamification/use-gamification'
import { Leaderboard } from '@/components/gamification/leaderboard'
import { XP_RULES } from '@/lib/gamification/rules'
import { LogOut, Shield, Mic, Trophy, Database, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { resetState, xp, level, streakDays, badges } = useGamification()

  const handleResetGamification = () => {
    resetState()
    toast.success('Gamification data reset')
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences."
      />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {user?.displayName || 'Demo User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || 'demo@salesleadcoach.dev'}
                </p>
              </div>
              <Button variant="outline" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dataverse Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />
              Dataverse Connection
            </CardTitle>
            <CardDescription>
              Configure your Microsoft Dataverse organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">
                  {process.env.NEXT_PUBLIC_DATAVERSE_RESOURCE || 'Not configured'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Set via environment variables
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                Mock Mode
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mic className="h-4 w-4" />
              Voice
            </CardTitle>
            <CardDescription>
              Configure voice input for lead creation and commands.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-enabled" className="text-sm">
                Enable voice commands
              </Label>
              <Switch id="voice-enabled" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-mock" className="text-sm">
                Use mock voice (dev)
              </Label>
              <Switch id="voice-mock" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Gamification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4" />
              Gamification
            </CardTitle>
            <CardDescription>
              XP rules, badges, and leaderboard settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="gamification-enabled" className="text-sm">
                Enable gamification
              </Label>
              <Switch id="gamification-enabled" defaultChecked />
            </div>

            <Separator />

            {/* XP Rules */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">XP Rules</p>
              <div className="flex flex-col gap-2">
                {XP_RULES.map((rule) => (
                  <div key={rule.type} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-foreground">{rule.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {rule.description}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                      +{rule.xp} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold tabular-nums text-foreground">{xp}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold tabular-nums text-foreground">{level}</p>
                <p className="text-xs text-muted-foreground">Level</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold tabular-nums text-foreground">{badges.filter((b) => b.unlockedAt).length}</p>
                <p className="text-xs text-muted-foreground">Badges</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetGamification}
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Gamification Data
            </Button>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardContent className="pt-6">
            <Leaderboard />
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data & Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>Gamification data is stored locally in your browser.</li>
              <li>Lead data is synced with your Dataverse organization.</li>
              <li>Voice commands are processed locally using Web Speech API (no audio leaves your device).</li>
              <li>The leaderboard is opt-in and uses sample data by default.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
