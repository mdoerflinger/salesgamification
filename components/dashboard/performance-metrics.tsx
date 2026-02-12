'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react'
import type { LeadEntity } from '@/types/dataverse'

interface PerformanceMetricsProps {
  leads: LeadEntity[]
}

export function PerformanceMetrics({ leads }: PerformanceMetricsProps) {
  const metrics = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - 7 * 86400000
    const monthAgo = now - 30 * 86400000

    const thisWeekLeads = leads.filter((l) => new Date(l.createdon).getTime() > weekAgo)
    const lastWeekLeads = leads.filter(
      (l) =>
        new Date(l.createdon).getTime() > weekAgo * 2 &&
        new Date(l.createdon).getTime() <= weekAgo
    )

    const thisMonthLeads = leads.filter((l) => new Date(l.createdon).getTime() > monthAgo)
    const qualifiedLeads = leads.filter((l) => l.statuscode === 3)

    // Calculate average response time (mock calculation)
    const avgResponseHours = 4.5

    // Week over week growth
    const weekGrowth =
      lastWeekLeads.length > 0
        ? ((thisWeekLeads.length - lastWeekLeads.length) / lastWeekLeads.length) * 100
        : thisWeekLeads.length > 0
          ? 100
          : 0

    // Conversion rate
    const conversionRate =
      leads.length > 0 ? (qualifiedLeads.length / leads.length) * 100 : 0

    return {
      weeklyGrowth: weekGrowth,
      conversionRate,
      avgResponseHours,
      monthlyLeads: thisMonthLeads.length,
    }
  }, [leads])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metriken</CardTitle>
        <CardDescription>Wichtige Kennzahlen im Überblick</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Wöchentl. Wachstum</span>
              {metrics.weeklyGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
            <div className="text-2xl font-bold">
              {metrics.weeklyGrowth >= 0 ? '+' : ''}
              {metrics.weeklyGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs. letzte Woche</p>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Qualifizierte Leads</p>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ø Reaktionszeit</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{metrics.avgResponseHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Bis erste Antwort</p>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monatliche Leads</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{metrics.monthlyLeads}</div>
            <p className="text-xs text-muted-foreground">Letzte 30 Tage</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
