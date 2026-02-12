'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Pie, PieChart } from 'recharts'
import type { LeadEntity } from '@/types/dataverse'

interface LeadSourceChartProps {
  leads: LeadEntity[]
}

const SOURCE_LABELS: Record<number, string> = {
  1: 'Werbung',
  2: 'Mitarbeiter',
  3: 'Extern',
  4: 'Partner',
  5: 'Öffentlich',
  6: 'Kampagne',
  7: 'Andere',
  8: 'Web',
}

export function LeadSourceChart({ leads }: LeadSourceChartProps) {
  const data = useMemo(() => {
    const sourceCounts: Record<number, number> = {}

    leads.forEach((lead) => {
      if (lead.leadsourcecode) {
        sourceCounts[lead.leadsourcecode] = (sourceCounts[lead.leadsourcecode] || 0) + 1
      }
    })

    return Object.entries(sourceCounts)
      .map(([source, count]) => ({
        name: SOURCE_LABELS[Number(source)] || `Quelle ${source}`,
        value: count,
        fill: `var(--color-source${source})`,
      }))
      .sort((a, b) => b.value - a.value)
  }, [leads])

  const chartConfig = {
    source1: { label: 'Werbung', color: 'hsl(var(--chart-1))' },
    source2: { label: 'Mitarbeiter', color: 'hsl(var(--chart-2))' },
    source3: { label: 'Extern', color: 'hsl(var(--chart-3))' },
    source4: { label: 'Partner', color: 'hsl(var(--chart-4))' },
    source5: { label: 'Öffentlich', color: 'hsl(var(--chart-5))' },
    source6: { label: 'Kampagne', color: 'hsl(221.2 83.2% 53.3%)' },
    source7: { label: 'Andere', color: 'hsl(280 100% 70%)' },
    source8: { label: 'Web', color: 'hsl(340.6 82.2% 67.8%)' },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead-Quellen</CardTitle>
        <CardDescription>Verteilung nach Herkunft</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
