'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, LayoutGrid, List } from 'lucide-react'
import { PageHeader } from '@/components/ds/page-header'
import { SearchInput } from '@/components/ds/search-input'
import { EmptyState } from '@/components/ds/empty-state'
import { Button } from '@/components/ui/button'
import { LeadCard } from '@/components/leads/lead-card'
import { ROUTES } from '@/lib/config/constants'
import type { LeadEntity } from '@/types/dataverse'

// Demo leads for initial scaffold
const DEMO_LEADS: LeadEntity[] = [
  {
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
    createdon: new Date(Date.now() - 5 * 86400000).toISOString(),
    modifiedon: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    leadid: 'lead-2',
    fullname: 'Thomas Weber',
    firstname: 'Thomas',
    lastname: 'Weber',
    companyname: 'DataFlow AG',
    emailaddress1: '',
    mobilephone: '+49 170 9876543',
    jobtitle: 'Head of IT',
    leadsourcecode: 7,
    statuscode: 1,
    statecode: 0,
    subject: 'Cloud Migration',
    createdon: new Date(Date.now() - 2 * 86400000).toISOString(),
    modifiedon: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    leadid: 'lead-3',
    fullname: 'Sarah Koch',
    firstname: 'Sarah',
    lastname: 'Koch',
    companyname: 'CloudFirst Inc',
    emailaddress1: 'sarah@cloudfirst.com',
    mobilephone: '',
    jobtitle: 'VP Engineering',
    leadsourcecode: 3,
    statuscode: 3,
    statecode: 0,
    subject: 'Dynamics 365 Implementation',
    createdon: new Date(Date.now() - 10 * 86400000).toISOString(),
    modifiedon: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    leadid: 'lead-4',
    fullname: 'Michael Braun',
    firstname: 'Michael',
    lastname: 'Braun',
    companyname: 'InnoSys Solutions',
    emailaddress1: 'michael@innosys.at',
    mobilephone: '+43 664 1112233',
    jobtitle: 'Managing Director',
    leadsourcecode: 4,
    statuscode: 1,
    statecode: 0,
    subject: 'Business Central',
    createdon: new Date(Date.now() - 20 * 86400000).toISOString(),
    modifiedon: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
]

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const filteredLeads = DEMO_LEADS.filter((lead) => {
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

      {/* Leads list/grid */}
      {filteredLeads.length > 0 ? (
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
      ) : (
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
      )}
    </div>
  )
}
