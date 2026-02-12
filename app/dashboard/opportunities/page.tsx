'use client'

import { useState, useMemo } from 'react'
import { Search, LayoutGrid, List, Target, DollarSign, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/ds/page-header'
import { SearchInput } from '@/components/ds/search-input'
import { EmptyState } from '@/components/ds/empty-state'
import { StatCard } from '@/components/ds/stat-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import { useOpportunities } from '@/lib/opportunities/hooks'
import { OPPORTUNITY_PHASE_LABELS, OPPORTUNITY_STATUS } from '@/lib/config/constants'

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [activePhaseTab, setActivePhaseTab] = useState<string>('all')

  const { opportunities, isLoading, error } = useOpportunities({
    search: searchQuery,
  })

  const filtered = useMemo(() => {
    let result = opportunities
    if (activePhaseTab !== 'all') {
      const phase = Number(activePhaseTab)
      result = result.filter((o) => o.phase === phase)
    }
    return result
  }, [opportunities, activePhaseTab])

  const totalValue = useMemo(
    () => opportunities.reduce((sum, o) => sum + (o.estimatedvalue ?? 0), 0),
    [opportunities]
  )

  const openCount = opportunities.filter(
    (o) => o.statuscode === OPPORTUNITY_STATUS.OPEN
  ).length

  const wonCount = opportunities.filter(
    (o) => o.statuscode === OPPORTUNITY_STATUS.WON
  ).length

  const winRate =
    openCount + wonCount > 0
      ? ((wonCount / (openCount + wonCount)) * 100).toFixed(0)
      : '0'

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Opportunities"
        description={`${opportunities.length} Verkaufschancen in der Pipeline`}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gesamt"
          value={isLoading ? '...' : opportunities.length}
          trend="neutral"
          description="Opportunities"
          icon={<Target />}
        />
        <StatCard
          label="Offen"
          value={isLoading ? '...' : openCount}
          trend="neutral"
          description="In der Pipeline"
          icon={<Target />}
        />
        <StatCard
          label="Pipeline-Wert"
          value={isLoading ? '...' : currencyFormatter.format(totalValue)}
          trend="up"
          description="Geschaetzter Gesamtwert"
          icon={<DollarSign />}
        />
        <StatCard
          label="Gewinnrate"
          value={isLoading ? '...' : `${winRate}%`}
          trend={Number(winRate) > 30 ? 'up' : 'neutral'}
          description="Won / Total"
          icon={<TrendingUp />}
        />
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-3">
        <div className="max-w-sm flex-1">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Opportunities suchen..."
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
            aria-label="Listenansicht"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
            aria-label="Rasteransicht"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Phase tabs */}
      <Tabs value={activePhaseTab} onValueChange={setActivePhaseTab}>
        <TabsList>
          <TabsTrigger value="all">Alle</TabsTrigger>
          {Object.entries(OPPORTUNITY_PHASE_LABELS).map(([phase, label]) => (
            <TabsTrigger key={phase} value={phase}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Fehler beim Laden der Opportunities.
        </div>
      )}

      {/* Opportunity list/grid */}
      {!isLoading && !error && filtered.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-3'
          }
        >
          {filtered.map((opp) => (
            <OpportunityCard key={opp.opportunityid} opportunity={opp} />
          ))}
        </div>
      ) : !isLoading && !error ? (
        <EmptyState
          title="Keine Opportunities gefunden"
          description={
            searchQuery
              ? 'Versuchen Sie einen anderen Suchbegriff.'
              : 'Opportunities werden automatisch erstellt, wenn ein Lead als "Gewonnen" markiert wird.'
          }
          icon={<Search />}
        />
      ) : null}
    </div>
  )
}
