'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, DollarSign, Calendar, FileText, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/ds/page-header'
import { StatusBadge } from '@/components/ds/status-badge'
import { EmptyState } from '@/components/ds/empty-state'
import { OpportunityPhaseStepper } from '@/components/opportunities/opportunity-phase-stepper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ROUTES, OPPORTUNITY_STATUS } from '@/lib/config/constants'
import {
  getOpportunityPhaseLabel,
  getOpportunityPhaseVariant,
  getOpportunityStatusLabel,
} from '@/lib/dataverse/mappers'
import {
  useOpportunityDetail,
  useAdvanceOpportunityPhase,
  useCloseOpportunityAsLost,
} from '@/lib/opportunities/hooks'
import { useGamification } from '@/lib/gamification/use-gamification'
import { OPPORTUNITY_PHASES } from '@/lib/config/constants'
import { toast } from 'sonner'

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { opportunity, isLoading, refresh } = useOpportunityDetail(id)
  const { advancePhase, isAdvancing } = useAdvanceOpportunityPhase()
  const { closeAsLost, isClosing } = useCloseOpportunityAsLost()
  const { awardXP } = useGamification()

  const handleAdvancePhase = async (nextPhase: number) => {
    await advancePhase({ id, phase: nextPhase })
    if (nextPhase === OPPORTUNITY_PHASES.GEWONNEN) {
      awardXP('win_opportunity', 'Opportunity als gewonnen abgeschlossen')
      toast.success('Opportunity gewonnen! +25 XP')
    } else {
      awardXP('advance_phase', `Phase auf "${getOpportunityPhaseLabel(nextPhase)}" geaendert`)
      toast.success(`Phase aktualisiert! +5 XP`)
    }
    refresh()
  }

  const handleCloseAsLost = async () => {
    await closeAsLost({ id })
    toast.success('Opportunity als verloren markiert.')
    refresh()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="p-6">
        <EmptyState
          title="Opportunity nicht gefunden"
          description="Die angeforderte Opportunity existiert nicht."
          icon={<FileText />}
        />
      </div>
    )
  }

  const isOpen = opportunity.statuscode === OPPORTUNITY_STATUS.OPEN
  const isWon = opportunity.statuscode === OPPORTUNITY_STATUS.WON
  const isLost = opportunity.statuscode === OPPORTUNITY_STATUS.LOST
  const phaseLabel = getOpportunityPhaseLabel(opportunity.phase)
  const phaseVariant = getOpportunityPhaseVariant(opportunity.phase)

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Back link */}
      <Link
        href={ROUTES.OPPORTUNITIES}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck zu Opportunities
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {opportunity.name}
            </h1>
            <StatusBadge status={isLost ? 'destructive' : isWon ? 'success' : phaseVariant}>
              {isLost ? 'Verloren' : isWon ? 'Gewonnen' : phaseLabel}
            </StatusBadge>
          </div>
          {opportunity.customerName && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {opportunity.customerName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOpen && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive">
                  <XCircle className="h-3.5 w-3.5" />
                  Als verloren markieren
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Opportunity als verloren markieren?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Die Opportunity wird als verloren markiert. Sie koennen den
                    Status nicht mehr aendern.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCloseAsLost} disabled={isClosing}>
                    {isClosing ? 'Wird gespeichert...' : 'Als verloren markieren'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Phase Stepper */}
      {isOpen && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Verkaufsphase</CardTitle>
          </CardHeader>
          <CardContent>
            <OpportunityPhaseStepper
              currentPhase={opportunity.phase}
              onAdvancePhase={handleAdvancePhase}
              isAdvancing={isAdvancing}
              disabled={!isOpen}
            />
          </CardContent>
        </Card>
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
                <InfoRow
                  icon={Building2}
                  label="Kunde"
                  value={opportunity.customerName}
                />
                <InfoRow
                  icon={DollarSign}
                  label="Geschaetzter Wert"
                  value={
                    opportunity.estimatedvalue
                      ? currencyFormatter.format(opportunity.estimatedvalue)
                      : undefined
                  }
                />
                {opportunity.actualvalue && (
                  <InfoRow
                    icon={DollarSign}
                    label="Tatsaechlicher Wert"
                    value={currencyFormatter.format(opportunity.actualvalue)}
                  />
                )}
                <InfoRow
                  label="Status"
                  value={getOpportunityStatusLabel(opportunity.statuscode)}
                />
                <InfoRow label="Phase" value={phaseLabel} />
                {opportunity.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Beschreibung
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {opportunity.description}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Timeline / Lead info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Zeitachse</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <InfoRow
                  icon={Calendar}
                  label="Erstellt"
                  value={new Date(opportunity.createdon).toLocaleDateString(
                    'de-DE'
                  )}
                />
                <InfoRow
                  icon={Calendar}
                  label="Zuletzt geaendert"
                  value={new Date(opportunity.modifiedon).toLocaleDateString(
                    'de-DE'
                  )}
                />
                {opportunity.actualclosedate && (
                  <InfoRow
                    icon={Calendar}
                    label="Abschlussdatum"
                    value={new Date(
                      opportunity.actualclosedate
                    ).toLocaleDateString('de-DE')}
                  />
                )}
                {opportunity._originatingleadid_value && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Urspruenglicher Lead
                      </p>
                      <Link
                        href={ROUTES.LEAD_DETAIL(
                          opportunity._originatingleadid_value
                        )}
                        className="mt-1 text-sm text-primary hover:underline"
                      >
                        {opportunity.leadName || 'Lead anzeigen'}
                      </Link>
                    </div>
                  </>
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
              <InfoRow label="Opportunity ID" value={opportunity.opportunityid} />
              <InfoRow label="Name" value={opportunity.name} />
              <InfoRow
                label="Geschaetzter Wert"
                value={
                  opportunity.estimatedvalue
                    ? currencyFormatter.format(opportunity.estimatedvalue)
                    : undefined
                }
              />
              <InfoRow
                label="Tatsaechlicher Wert"
                value={
                  opportunity.actualvalue
                    ? currencyFormatter.format(opportunity.actualvalue)
                    : undefined
                }
              />
              <InfoRow label="Phase" value={phaseLabel} />
              <InfoRow
                label="Status"
                value={getOpportunityStatusLabel(opportunity.statuscode)}
              />
              <InfoRow
                label="Erstellt"
                value={new Date(opportunity.createdon).toLocaleDateString(
                  'de-DE'
                )}
              />
              <InfoRow
                label="Geaendert"
                value={new Date(opportunity.modifiedon).toLocaleDateString(
                  'de-DE'
                )}
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
