'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import type { LeadEntity } from '@/types/dataverse'

interface LeadPipelineChartProps {
  leads: LeadEntity[]
}

const STATUS_LABELS: Record<number, string> = {
  1: 'Neu',
  2: 'Kontaktiert',
  3: 'Qualifiziert',
  4: 'Verloren',
  5: 'Disqualifiziert',
}

export function LeadPipelineChart({ leads }: LeadPipelineChartProps) {
  const data = useMemo(() => {
    const statusCounts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    leads.forEach((lead) => {
      if (lead.statuscode && statusCounts[lead.statuscode] !== undefined) {
        statusCounts[lead.statuscode]++
      }
    })

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: STATUS_LABELS[Number(status)] || `Status ${status}`,
      count,
      fill: `var(--color-status${status})`,
    }))
  }, [leads])

  const chartConfig = {
    status1: { label: 'Neu', color: 'hsl(var(--chart-1))' },
    status2: { label: 'Kontaktiert', color: 'hsl(var(--chart-2))' },
    status3: { label: 'Qualifiziert', color: 'hsl(var(--chart-3))' },
    status4: { label: 'Verloren', color: 'hsl(var(--chart-4))' },
    status5: { label: 'Disqualifiziert', color: 'hsl(var(--chart-5))' },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Pipeline</CardTitle>
        <CardDescription>Verteilung nach Status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="status"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
