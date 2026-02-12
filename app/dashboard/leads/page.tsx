'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, LayoutGrid, List } from 'lucide-react'
import { PageHeader } from '@/components/ds/page-header'
import { SearchInput } from '@/components/ds/search-input'
import { EmptyState } from '@/components/ds/empty-state'
import { Button } from '@/components/ui/button'
import { LeadCard } from '@/components/leads/lead-card'
import { useLeads } from '@/lib/leads/hooks'
import { ROUTES } from '@/lib/config/constants'

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const { leads, isLoading, error } = useLeads({ search: searchQuery })

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      lead.fullname?.toLowerCase().includes(query) ||
      lead.companyname?.toLowerCase().includes(query) ||
      lead.emailaddress1?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Leads"
        description={`${filteredLeads.length} leads in your pipeline`}
        actions={
          <Link href={ROUTES.LEADS_NEW}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Lead
            </Button>
          </Link>
        }
      />

      {/* Search and View Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads..."
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          Failed to load leads. Please try again.
        </div>
      )}

      {/* Leads list/grid */}
      {!isLoading && !error && filteredLeads.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-3'
          }
        >
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.leadid} lead={lead} />
          ))}
        </div>
      ) : !isLoading && !error ? (
        <EmptyState
          title="No leads found"
          description={
            searchQuery
              ? 'Try a different search term.'
              : 'Create your first lead to get started.'
          }
          icon={<Search />}
          action={
            !searchQuery ? (
              <Link href={ROUTES.LEADS_NEW}>
                <Button>Create Lead</Button>
              </Link>
            ) : undefined
          }
        />
      ) : null}
    </div>
  )
}
