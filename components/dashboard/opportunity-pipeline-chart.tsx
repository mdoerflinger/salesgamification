'use client'

import { useMemo } from 'react'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OPPORTUNITY_PHASE_LABELS } from '@/lib/config/constants'
import type { OpportunityEntity } from '@/types/dataverse'

interface OpportunityPipelineChartProps {
  opportunities: OpportunityEntity[]
}

export function OpportunityPipelineChart({
  opportunities,
}: OpportunityPipelineChartProps) {
  const chartData = useMemo(() => {
    const phaseCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
    for (const opp of opportunities) {
      if (phaseCounts[opp.phase] !== undefined) {
        phaseCounts[opp.phase]++
      }
    }
    return Object.entries(phaseCounts).map(([phase, count]) => ({
      phase: OPPORTUNITY_PHASE_LABELS[Number(phase)],
      Anzahl: count,
    }))
  }, [opportunities])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Opportunity Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="phase"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Bar
                dataKey="Anzahl"
                fill="hsl(var(--chart-2))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
