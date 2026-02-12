'use client'

import { useMemo } from 'react'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OPPORTUNITY_PHASE_LABELS } from '@/lib/config/constants'
import type { OpportunityEntity } from '@/types/dataverse'

interface OpportunityValueChartProps {
  opportunities: OpportunityEntity[]
}

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export function OpportunityValueChart({
  opportunities,
}: OpportunityValueChartProps) {
  const chartData = useMemo(() => {
    const phaseValues: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
    for (const opp of opportunities) {
      if (phaseValues[opp.phase] !== undefined) {
        phaseValues[opp.phase] += opp.estimatedvalue ?? 0
      }
    }
    return Object.entries(phaseValues).map(([phase, value]) => ({
      phase: OPPORTUNITY_PHASE_LABELS[Number(phase)],
      Wert: value,
    }))
  }, [opportunities])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Pipeline-Wert nach Phase
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
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => currencyFormatter.format(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--card-foreground))',
                }}
              />
              <Bar
                dataKey="Wert"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
