'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import type { LeadEntity } from '@/types/dataverse'

interface ActivityChartProps {
  leads: LeadEntity[]
}

export function ActivityChart({ leads }: ActivityChartProps) {
  const data = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }),
        created: 0,
        updated: 0,
      }
    })

    leads.forEach((lead) => {
      const createdDate = new Date(lead.createdon).toISOString().split('T')[0]
      const modifiedDate = new Date(lead.modifiedon).toISOString().split('T')[0]

      const createdDay = last30Days.find((d) => d.date === createdDate)
      if (createdDay) createdDay.created++

      const modifiedDay = last30Days.find((d) => d.date === modifiedDate)
      if (modifiedDay && createdDate !== modifiedDate) modifiedDay.updated++
    })

    return last30Days
  }, [leads])

  const chartConfig = {
    created: { label: 'Erstellt', color: 'hsl(var(--chart-1))' },
    updated: { label: 'Aktualisiert', color: 'hsl(var(--chart-2))' },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitätsverlauf</CardTitle>
        <CardDescription>Letzte 30 Tage</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-created)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-created)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillUpdated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-updated)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-updated)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="created"
              stroke="var(--color-created)"
              fill="url(#fillCreated)"
              stackId="a"
            />
            <Area
              type="monotone"
              dataKey="updated"
              stroke="var(--color-updated)"
              fill="url(#fillUpdated)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
