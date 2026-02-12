'use client'

import Link from 'next/link'
import { Building2, Calendar, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ds/status-badge'
import type { OpportunityEntity } from '@/types/dataverse'
import {
  getOpportunityPhaseLabel,
  getOpportunityPhaseVariant,
  getOpportunityStatusLabel,
} from '@/lib/dataverse/mappers'
import { ROUTES, OPPORTUNITY_STATUS } from '@/lib/config/constants'

interface OpportunityCardProps {
  opportunity: OpportunityEntity
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const phaseLabel = getOpportunityPhaseLabel(opportunity.phase)
  const phaseVariant = getOpportunityPhaseVariant(opportunity.phase)
  const isLost = opportunity.statuscode === OPPORTUNITY_STATUS.LOST

  const formattedValue = opportunity.estimatedvalue
    ? new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(opportunity.estimatedvalue)
    : null

  const modifiedDate = new Date(opportunity.modifiedon).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <Link href={ROUTES.OPPORTUNITY_DETAIL(opportunity.opportunityid)}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 overflow-hidden">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {opportunity.name}
              </h3>
              {opportunity.customerName && (
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{opportunity.customerName}</span>
                </div>
              )}
            </div>
            <StatusBadge status={isLost ? 'destructive' : phaseVariant}>
              {isLost ? getOpportunityStatusLabel(opportunity.statuscode) : phaseLabel}
            </StatusBadge>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {formattedValue && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>{formattedValue}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{modifiedDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
