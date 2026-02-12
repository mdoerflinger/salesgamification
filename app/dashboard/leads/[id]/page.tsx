'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, CalendarPlus, FileText, Building2, User, Briefcase } from 'lucide-react'
import { PageHeader } from '@/components/ds/page-header'
import { StatusBadge } from '@/components/ds/status-badge'
import { HealthChips } from '@/components/leads/health-chips'
import { FollowUpCard } from '@/components/follow-ups/follow-up-card'
import { EmptyState } from '@/components/ds/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/lib/config/constants'
import { getLeadDisplayName, getLeadStatusLabel, getLeadStatusVariant, computeLeadHealth } from '@/lib/dataverse/mappers'
import { useGamification } from '@/lib/gamification/use-gamification'
import type { LeadEntity } from '@/types/dataverse'
import type { FollowUpItem, HealthIssue } from '@/types'
import { toast } from 'sonner'

// Demo data for the scaffold
const DEMO_LEAD: LeadEntity = {
  leadid: 'lead-1',
  fullname: 'Anna Mueller',
  firstname: 'Anna',
  lastname: 'Mueller',
  companyname: 'TechVentures GmbH',
  emailaddress1: 'anna@techventures.de',
  mobilephone: '+49 151 1234567',
  jobtitle: 'CTO',
  leadsourcecode: 8,
  statuscode: 2,
  statecode: 0,
  subject: 'ERP Migration Interest',
  description: 'Interested in migrating from SAP to Dynamics 365. Key decision maker, reports directly to CEO.',
  revenue: 150000,
  createdon: new Date(Date.now() - 5 * 86400000).toISOString(),
  modifiedon: new Date(Date.now() - 1 * 86400000).toISOString(),
}

const DEMO_FOLLOW_UPS: FollowUpItem[] = [
  {
    id: 'task-1',
    subject: 'Discuss pricing proposal',
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
  const lead = DEMO_LEAD
  const displayName = getLeadDisplayName(lead)
  const statusLabel = getLeadStatusLabel(lead.statuscode)
  const statusVariant = getLeadStatusVariant(lead.statuscode)
  const health = computeLeadHealth(lead, DEMO_FOLLOW_UPS.length > 0)
  const { awardXP } = useGamification()

  const handleFixIssue = (issue: HealthIssue) => {
    awardXP('fix_missing_field', `Fixed: ${issue}`)
    toast.success(`Would open editor for: ${issue}`)
  }

  const handleCompleteFollowUp = (taskId: string) => {
    awardXP('followup_ontime', 'Completed follow-up')
    toast.success('Follow-up completed! +5 XP')
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Back link */}
      <Link href={ROUTES.LEADS} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Leads
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
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
          <Button variant="outline" size="sm" className="gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            Call
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Email
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Note
          </Button>
          <Button size="sm" className="gap-1.5">
            <CalendarPlus className="h-3.5 w-3.5" />
            Follow-up
          </Button>
        </div>
      </div>

      {/* Health chips */}
      {health.issues.length > 0 && (
        <HealthChips issues={health.issues} onFix={handleFixIssue} />
      )}

      {/* Tabbed content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Key info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Information</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <InfoRow icon={User} label="Name" value={displayName} />
                <InfoRow icon={Building2} label="Company" value={lead.companyname} />
                <InfoRow icon={Briefcase} label="Job Title" value={lead.jobtitle} />
                <InfoRow icon={Mail} label="Email" value={lead.emailaddress1} />
                <InfoRow icon={Phone} label="Phone" value={lead.mobilephone} />
                {lead.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Notes</p>
                      <p className="mt-1 text-sm text-foreground">{lead.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Upcoming follow-ups */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Upcoming Follow-ups</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  <CalendarPlus className="h-3 w-3" />
                  Add
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
                    title="No follow-ups"
                    description="Schedule a follow-up to stay on track."
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
                title="No activities yet"
                description="Activities will appear here when connected to Dataverse."
                icon={<FileText />}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Fields</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <InfoRow label="Lead ID" value={lead.leadid} />
              <InfoRow label="Subject" value={lead.subject} />
              <InfoRow label="Status" value={statusLabel} />
              <InfoRow label="Source" value={lead.leadsourcecode?.toString()} />
              <InfoRow label="Revenue" value={lead.revenue ? `$${lead.revenue.toLocaleString()}` : undefined} />
              <InfoRow label="Created" value={new Date(lead.createdon).toLocaleDateString()} />
              <InfoRow label="Modified" value={new Date(lead.modifiedon).toLocaleDateString()} />
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
      <span className="text-xs font-medium text-muted-foreground min-w-20">{label}</span>
      <span className="text-sm text-foreground">
        {value || <span className="text-muted-foreground italic">Not set</span>}
      </span>
    </div>
  )
}
