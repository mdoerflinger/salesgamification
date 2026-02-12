'use client'

import Link from 'next/link'
import { Building2, Mail, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ds/status-badge'
import { HealthChips } from './health-chips'
import type { LeadEntity } from '@/types/dataverse'
import type { HealthIssue } from '@/types'
import { getLeadDisplayName, getLeadStatusLabel, getLeadStatusVariant, computeLeadHealth } from '@/lib/dataverse/mappers'
import { ROUTES } from '@/lib/config/constants'

interface LeadCardProps {
  lead: LeadEntity
  hasFollowUp?: boolean
}

export function LeadCard({ lead, hasFollowUp = false }: LeadCardProps) {
  const displayName = getLeadDisplayName(lead)
  const statusLabel = getLeadStatusLabel(lead.statuscode)
  const statusVariant = getLeadStatusVariant(lead.statuscode)
  const health = computeLeadHealth(lead, hasFollowUp)

  return (
    <Link href={ROUTES.LEAD_DETAIL(lead.leadid)}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 overflow-hidden">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </h3>
              {lead.companyname && (
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{lead.companyname}</span>
                </div>
              )}
            </div>
            <StatusBadge status={statusVariant}>{statusLabel}</StatusBadge>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {lead.emailaddress1 && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate">{lead.emailaddress1}</span>
              </div>
            )}
            {lead.mobilephone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{lead.mobilephone}</span>
              </div>
            )}
          </div>

          {health.issues.length > 0 && (
            <HealthChips issues={health.issues} compact />
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
