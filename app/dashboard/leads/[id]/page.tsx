'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, CalendarPlus, FileText, Building2, User, Briefcase, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/ds/page-header'
import { StatusBadge } from '@/components/ds/status-badge'
import { HealthChips } from '@/components/leads/health-chips'
import { LeadStatusSelector } from '@/components/leads/lead-status-selector'
import { FollowUpCard } from '@/components/follow-ups/follow-up-card'
import { EmptyState } from '@/components/ds/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ROUTES, LEAD_STATUS } from '@/lib/config/constants'
import { getLeadDisplayName, getLeadStatusLabel, getLeadStatusVariant, computeLeadHealth } from '@/lib/dataverse/mappers'
import { useGamification } from '@/lib/gamification/use-gamification'
import { useLeadDetail, useUpdateLead } from '@/lib/leads/hooks'
import { useCreateOpportunityFromLead } from '@/lib/opportunities/hooks'
import type { HealthIssue, FollowUpItem } from '@/types'
import { toast } from 'sonner'

// Demo follow-ups
const DEMO_FOLLOW_UPS: FollowUpItem[] = [
  {
    id: 'task-1',
    subject: 'Preisvorschlag besprechen',
    leadId: 'lead-1',
    leadName: 'Anna Mueller',
    companyName: 'TechVentures GmbH',
    scheduledDate: new Date().toISOString(),
    priority: 2,
    status: 0,
    group: 'today',
  },
]

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { lead, isLoading, refresh } = useLeadDetail(id)
  const { updateLead } = useUpdateLead()
  const { createFromLead } = useCreateOpportunityFromLead()
  const { awardXP } = useGamification()
  const [createdOpportunityId, setCreatedOpportunityId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="p-6">
        <EmptyState
          title="Lead nicht gefunden"
          description="Der angeforderte Lead existiert nicht."
          icon={<FileText />}
        />
      </div>
    )
  }

  const displayName = getLeadDisplayName(lead)
  const statusLabel = getLeadStatusLabel(lead.statuscode)
  const statusVariant = getLeadStatusVariant(lead.statuscode)
  const health = computeLeadHealth(lead, DEMO_FOLLOW_UPS.length > 0)

  const handleStatusChange = async (newStatus: number) => {
    await updateLead({ id: lead.leadid, patch: { statuscode: newStatus } })

    // If status is "Gewonnen", auto-create opportunity
    if (newStatus === LEAD_STATUS.GEWONNEN) {
      try {
        const opp = await createFromLead({ leadId: lead.leadid })
        if (opp) {
          setCreatedOpportunityId(opp.opportunityid)
          toast.success('Lead als gewonnen markiert! Opportunity wurde erstellt.')
        }
      } catch {
        toast.success('Lead als gewonnen markiert!')
      }
    } else {
      toast.success(`Status auf "${getLeadStatusLabel(newStatus)}" geaendert.`)
    }

    refresh()
  }

  const handleFixIssue = (issue: HealthIssue) => {
    awardXP('fix_missing_field', `Fixed: ${issue}`)
    toast.success(`Editor wuerde geoeffnet fuer: ${issue}`)
  }

  const handleCompleteFollowUp = (taskId: string) => {
    awardXP('followup_ontime', 'Follow-up abgeschlossen')
    toast.success('Follow-up abgeschlossen! +5 XP')
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Back link */}
      <Link
        href={ROUTES.LEADS}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck zu Leads
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {displayName}
            </h1>
            <StatusBadge status={statusVariant}>{statusLabel}</StatusBadge>
          </div>
          {lead.companyname && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {lead.companyname}
              {lead.jobtitle && <> &middot; {lead.jobtitle}</>}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <LeadStatusSelector
            currentStatus={lead.statuscode}
            onStatusChange={handleStatusChange}
          />
          <Button variant="outline" size="sm" className="gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            Anrufen
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            E-Mail
          </Button>
          <Button size="sm" className="gap-1.5">
            <CalendarPlus className="h-3.5 w-3.5" />
            Follow-up
          </Button>
        </div>
      </div>

      {/* Created opportunity link */}
      {createdOpportunityId && (
        <div className="flex items-center gap-2 rounded-md border border-success/20 bg-success/10 p-3 text-sm">
          <span className="text-success">
            Eine Opportunity wurde automatisch erstellt.
          </span>
          <Link
            href={ROUTES.OPPORTUNITY_DETAIL(createdOpportunityId)}
            className="flex items-center gap-1 font-medium text-primary hover:underline"
          >
            Opportunity anzeigen
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Health chips */}
      {health.issues.length > 0 && (
        <HealthChips issues={health.issues} onFix={handleFixIssue} />
      )}

      {/* Tabbed content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Uebersicht</TabsTrigger>
          <TabsTrigger value="activities">Aktivitaeten</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Key info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kerninformationen</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <InfoRow icon={User} label="Name" value={displayName} />
                <InfoRow icon={Building2} label="Firma" value={lead.companyname} />
                <InfoRow icon={Briefcase} label="Position" value={lead.jobtitle} />
                <InfoRow icon={Mail} label="E-Mail" value={lead.emailaddress1} />
                <InfoRow icon={Phone} label="Telefon" value={lead.mobilephone} />
                {lead.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Notizen</p>
                      <p className="mt-1 text-sm text-foreground">{lead.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Upcoming follow-ups */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Anstehende Follow-ups</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  <CalendarPlus className="h-3 w-3" />
                  Hinzufuegen
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {DEMO_FOLLOW_UPS.length > 0 ? (
                  DEMO_FOLLOW_UPS.map((item) => (
                    <FollowUpCard
                      key={item.id}
                      item={item}
                      onComplete={handleCompleteFollowUp}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="Keine Follow-ups"
                    description="Planen Sie ein Follow-up, um am Ball zu bleiben."
                    icon={<CalendarPlus />}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <Card>
            <CardContent className="py-8">
              <EmptyState
                title="Keine Aktivitaeten"
                description="Aktivitaeten werden hier angezeigt, sobald sie mit Dataverse verbunden sind."
                icon={<FileText />}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alle Felder</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <InfoRow label="Lead ID" value={lead.leadid} />
              <InfoRow label="Betreff" value={lead.subject} />
              <InfoRow label="Status" value={statusLabel} />
              <InfoRow label="Quelle" value={lead.leadsourcecode?.toString()} />
              <InfoRow
                label="Umsatz"
                value={
                  lead.revenue
                    ? new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(lead.revenue)
                    : undefined
                }
              />
              <InfoRow
                label="Erstellt"
                value={new Date(lead.createdon).toLocaleDateString('de-DE')}
              />
              <InfoRow
                label="Geaendert"
                value={new Date(lead.modifiedon).toLocaleDateString('de-DE')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType
  label: string
  value?: string | null
}) {
  return (
    <div className="flex items-center gap-3">
      {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
      <span className="min-w-20 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">
        {value || (
          <span className="italic text-muted-foreground">Nicht gesetzt</span>
        )}
      </span>
    </div>
  )
}
