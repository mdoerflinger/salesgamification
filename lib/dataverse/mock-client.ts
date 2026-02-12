/**
 * MockDataverseClient: In-memory Dataverse client for demo mode.
 * Stores data in localStorage and simulates API behavior.
 */
import type {
  LeadEntity,
  LeadCreateDto,
  LeadUpdateDto,
  TaskEntity,
  TaskCreateDto,
  ActivityEntity,
  OpportunityEntity,
  OpportunityCreateDto,
  OpportunityUpdateDto,
  ODataCollectionResponse,
} from '@/types/dataverse'
import { DEFAULT_PAGE_SIZE, OPPORTUNITY_PHASES, OPPORTUNITY_STATUS } from '@/lib/config/constants'

const STORAGE_KEY = 'mock-dataverse-leads'
const STORAGE_KEY_TASKS = 'mock-dataverse-tasks'
const STORAGE_KEY_OPPORTUNITIES = 'mock-dataverse-opportunities'

// Demo leads for initial data
const INITIAL_LEADS: LeadEntity[] = [
  {
    leadid: 'lead-demo-1',
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
    leadid: 'lead-demo-2',
    fullname: 'Thomas Weber',
    firstname: 'Thomas',
    lastname: 'Weber',
    companyname: 'DataFlow AG',
    emailaddress1: 'thomas@dataflow.com',
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
    leadid: 'lead-demo-3',
    fullname: 'Sarah Koch',
    firstname: 'Sarah',
    lastname: 'Koch',
    companyname: 'CloudFirst Inc',
    emailaddress1: 'sarah@cloudfirst.com',
    mobilephone: '+49 160 5554321',
    jobtitle: 'VP Engineering',
    leadsourcecode: 3,
    statuscode: 3,
    statecode: 0,
    subject: 'Dynamics 365 Implementation',
    createdon: new Date(Date.now() - 10 * 86400000).toISOString(),
    modifiedon: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
]

// Demo opportunities
const INITIAL_OPPORTUNITIES: OpportunityEntity[] = [
  {
    opportunityid: 'opp-demo-1',
    name: 'ERP Migration TechVentures',
    description: 'Vollstaendige ERP-Migration auf Dynamics 365',
    estimatedvalue: 85000,
    statuscode: 1,
    statecode: 0,
    phase: 3,
    _customerid_value: 'acc-demo-1',
    customerName: 'TechVentures GmbH',
    _originatingleadid_value: 'lead-demo-1',
    leadName: 'Anna Mueller',
    createdon: new Date(Date.now() - 15 * 86400000).toISOString(),
    modifiedon: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    opportunityid: 'opp-demo-2',
    name: 'Cloud Migration DataFlow',
    description: 'Azure Cloud Migration Projekt',
    estimatedvalue: 120000,
    statuscode: 1,
    statecode: 0,
    phase: 2,
    _customerid_value: 'acc-demo-2',
    customerName: 'DataFlow AG',
    _originatingleadid_value: 'lead-demo-2',
    leadName: 'Thomas Weber',
    createdon: new Date(Date.now() - 8 * 86400000).toISOString(),
    modifiedon: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    opportunityid: 'opp-demo-3',
    name: 'D365 Implementation CloudFirst',
    description: 'Dynamics 365 Einfuehrung',
    estimatedvalue: 200000,
    statuscode: 2,
    statecode: 1,
    phase: 4,
    _customerid_value: 'acc-demo-3',
    customerName: 'CloudFirst Inc',
    _originatingleadid_value: 'lead-demo-3',
    leadName: 'Sarah Koch',
    createdon: new Date(Date.now() - 30 * 86400000).toISOString(),
    modifiedon: new Date(Date.now() - 5 * 86400000).toISOString(),
    actualclosedate: new Date(Date.now() - 5 * 86400000).toISOString(),
    actualvalue: 195000,
  },
  {
    opportunityid: 'opp-demo-4',
    name: 'CRM Beratung InnoSoft',
    description: 'CRM-Beratungsprojekt',
    estimatedvalue: 45000,
    statuscode: 1,
    statecode: 0,
    phase: 1,
    _customerid_value: 'acc-demo-4',
    customerName: 'InnoSoft GmbH',
    createdon: new Date(Date.now() - 3 * 86400000).toISOString(),
    modifiedon: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
]

export class MockDataverseClient {
  private delay = 300 // Simulate network delay

  private async simulateDelay() {
    await new Promise((resolve) => setTimeout(resolve, this.delay))
  }

  private getLeadsFromStorage(): LeadEntity[] {
    if (typeof window === 'undefined') return INITIAL_LEADS
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADS))
      return INITIAL_LEADS
    }
    return JSON.parse(stored)
  }

  private saveLeadsToStorage(leads: LeadEntity[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
  }

  private getTasksFromStorage(): TaskEntity[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEY_TASKS)
    return stored ? JSON.parse(stored) : []
  }

  private saveTasksToStorage(tasks: TaskEntity[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks))
  }

  async createLead(payload: LeadCreateDto): Promise<LeadEntity> {
    await this.simulateDelay()
    const leads = this.getLeadsFromStorage()
    const newLead: LeadEntity = {
      leadid: `lead-${Date.now()}`,
      fullname: `${payload.firstname || ''} ${payload.lastname || ''}`.trim(),
      firstname: payload.firstname,
      lastname: payload.lastname,
      companyname: payload.companyname,
      emailaddress1: payload.emailaddress1 || '',
      mobilephone: payload.mobilephone || '',
      telephone1: payload.telephone1,
      jobtitle: payload.jobtitle,
      leadsourcecode: payload.leadsourcecode || 1,
      statuscode: 1,
      statecode: 0,
      subject: payload.subject,
      description: payload.description,
      revenue: payload.revenue,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }

    leads.unshift(newLead)
    this.saveLeadsToStorage(leads)
    return newLead
  }

  async updateLead(id: string, patch: LeadUpdateDto): Promise<void> {
    await this.simulateDelay()
    const leads = this.getLeadsFromStorage()
    const index = leads.findIndex((l) => l.leadid === id)
    if (index === -1) throw new Error('Lead not found')

    leads[index] = {
      ...leads[index],
      ...patch,
      modifiedon: new Date().toISOString(),
    }
    this.saveLeadsToStorage(leads)
  }

  async getLead(id: string): Promise<LeadEntity> {
    await this.simulateDelay()
    const leads = this.getLeadsFromStorage()
    const lead = leads.find((l) => l.leadid === id)
    if (!lead) throw new Error('Lead not found')
    return lead
  }

  async getLeads(opts: {
    top?: number
    search?: string
    filter?: string
    orderBy?: string
  } = {}): Promise<ODataCollectionResponse<LeadEntity>> {
    await this.simulateDelay()
    let leads = this.getLeadsFromStorage()

    // Apply search filter
    if (opts.search) {
      const search = opts.search.toLowerCase()
      leads = leads.filter(
        (l) =>
          l.fullname?.toLowerCase().includes(search) ||
          l.companyname?.toLowerCase().includes(search) ||
          l.emailaddress1?.toLowerCase().includes(search)
      )
    }

    // Apply top limit
    const top = opts.top ?? DEFAULT_PAGE_SIZE
    leads = leads.slice(0, top)

    return {
      value: leads,
    }
  }

  async createTaskFollowUp(
    leadId: string,
    dto: TaskCreateDto
  ): Promise<TaskEntity> {
    await this.simulateDelay()
    const tasks = this.getTasksFromStorage()
    const newTask: TaskEntity = {
      activityid: `task-${Date.now()}`,
      subject: dto.subject,
      description: dto.description,
      scheduledstart: dto.scheduledstart,
      scheduledend: dto.scheduledend,
      prioritycode: dto.prioritycode || 1,
      statecode: 0,
      statuscode: 2,
      _regardingobjectid_value: leadId,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }

    tasks.push(newTask)
    this.saveTasksToStorage(tasks)
    return newTask
  }

  async completeTask(taskId: string): Promise<void> {
    await this.simulateDelay()
    const tasks = this.getTasksFromStorage()
    const index = tasks.findIndex((t) => t.activityid === taskId)
    if (index === -1) throw new Error('Task not found')

    tasks[index] = {
      ...tasks[index],
      statecode: 1,
      statuscode: 5,
      modifiedon: new Date().toISOString(),
    }
    this.saveTasksToStorage(tasks)
  }

  async getLeadTasks(
    leadId: string,
    top = 20
  ): Promise<ODataCollectionResponse<TaskEntity>> {
    await this.simulateDelay()
    const tasks = this.getTasksFromStorage()
    const filtered = tasks
      .filter((t) => t._regardingobjectid_value === leadId)
      .slice(0, top)

    return {
      value: filtered,
    }
  }

  async listLeadActivities(
    leadId: string,
    top = 20
  ): Promise<ODataCollectionResponse<ActivityEntity>> {
    await this.simulateDelay()
    // For now, return empty activities in mock mode
    return {
      value: [],
    }
  }

  // ── Opportunities ──

  private getOpportunitiesFromStorage(): OpportunityEntity[] {
    if (typeof window === 'undefined') return INITIAL_OPPORTUNITIES
    const stored = localStorage.getItem(STORAGE_KEY_OPPORTUNITIES)
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(INITIAL_OPPORTUNITIES))
      return INITIAL_OPPORTUNITIES
    }
    return JSON.parse(stored)
  }

  private saveOpportunitiesToStorage(opps: OpportunityEntity[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(opps))
  }

  async createOpportunity(dto: OpportunityCreateDto): Promise<OpportunityEntity> {
    await this.simulateDelay()
    const opps = this.getOpportunitiesFromStorage()
    const newOpp: OpportunityEntity = {
      opportunityid: `opp-${Date.now()}`,
      name: dto.name,
      description: dto.description,
      estimatedvalue: dto.estimatedvalue,
      statuscode: OPPORTUNITY_STATUS.OPEN,
      statecode: 0,
      phase: dto.phase ?? OPPORTUNITY_PHASES.NEU,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }
    opps.unshift(newOpp)
    this.saveOpportunitiesToStorage(opps)
    return newOpp
  }

  async updateOpportunity(id: string, patch: OpportunityUpdateDto): Promise<void> {
    await this.simulateDelay()
    const opps = this.getOpportunitiesFromStorage()
    const index = opps.findIndex((o) => o.opportunityid === id)
    if (index === -1) throw new Error('Opportunity not found')
    opps[index] = {
      ...opps[index],
      ...patch,
      modifiedon: new Date().toISOString(),
    }
    this.saveOpportunitiesToStorage(opps)
  }

  async getOpportunity(id: string): Promise<OpportunityEntity> {
    await this.simulateDelay()
    const opps = this.getOpportunitiesFromStorage()
    const opp = opps.find((o) => o.opportunityid === id)
    if (!opp) throw new Error('Opportunity not found')
    return opp
  }

  async getOpportunities(opts: {
    top?: number
    search?: string
    filter?: string
    orderBy?: string
  } = {}): Promise<ODataCollectionResponse<OpportunityEntity>> {
    await this.simulateDelay()
    let opps = this.getOpportunitiesFromStorage()

    if (opts.search) {
      const search = opts.search.toLowerCase()
      opps = opps.filter(
        (o) =>
          o.name?.toLowerCase().includes(search) ||
          o.customerName?.toLowerCase().includes(search) ||
          o.description?.toLowerCase().includes(search)
      )
    }

    const top = opts.top ?? DEFAULT_PAGE_SIZE
    opps = opps.slice(0, top)

    return { value: opps }
  }

  async setOpportunityPhase(id: string, phase: number): Promise<void> {
    await this.simulateDelay()
    const opps = this.getOpportunitiesFromStorage()
    const index = opps.findIndex((o) => o.opportunityid === id)
    if (index === -1) throw new Error('Opportunity not found')

    opps[index].phase = phase
    opps[index].modifiedon = new Date().toISOString()

    // Auto-close as won if phase = 4 (Gewonnen)
    if (phase === OPPORTUNITY_PHASES.GEWONNEN) {
      opps[index].statuscode = OPPORTUNITY_STATUS.WON
      opps[index].statecode = 1
      opps[index].actualclosedate = new Date().toISOString()
      opps[index].actualvalue = opps[index].estimatedvalue
    }

    this.saveOpportunitiesToStorage(opps)
  }

  async closeOpportunityAsWon(id: string, actualValue?: number): Promise<void> {
    await this.simulateDelay()
    const opps = this.getOpportunitiesFromStorage()
    const index = opps.findIndex((o) => o.opportunityid === id)
    if (index === -1) throw new Error('Opportunity not found')

    opps[index].phase = OPPORTUNITY_PHASES.GEWONNEN
    opps[index].statuscode = OPPORTUNITY_STATUS.WON
    opps[index].statecode = 1
    opps[index].actualclosedate = new Date().toISOString()
    opps[index].actualvalue = actualValue ?? opps[index].estimatedvalue
    opps[index].modifiedon = new Date().toISOString()
    this.saveOpportunitiesToStorage(opps)
  }

  async closeOpportunityAsLost(id: string): Promise<void> {
    await this.simulateDelay()
    const opps = this.getOpportunitiesFromStorage()
    const index = opps.findIndex((o) => o.opportunityid === id)
    if (index === -1) throw new Error('Opportunity not found')

    opps[index].statuscode = OPPORTUNITY_STATUS.LOST
    opps[index].statecode = 2
    opps[index].actualclosedate = new Date().toISOString()
    opps[index].modifiedon = new Date().toISOString()
    this.saveOpportunitiesToStorage(opps)
  }

  async createOpportunityFromLead(leadId: string): Promise<OpportunityEntity> {
    await this.simulateDelay()
    const leads = this.getLeadsFromStorage()
    const lead = leads.find((l) => l.leadid === leadId)
    if (!lead) throw new Error('Lead not found')

    const opps = this.getOpportunitiesFromStorage()
    const newOpp: OpportunityEntity = {
      opportunityid: `opp-${Date.now()}`,
      name: lead.subject || `Opportunity - ${lead.fullname || lead.companyname}`,
      description: lead.description,
      estimatedvalue: lead.revenue,
      statuscode: OPPORTUNITY_STATUS.OPEN,
      statecode: 0,
      phase: OPPORTUNITY_PHASES.NEU,
      _originatingleadid_value: lead.leadid,
      leadName: lead.fullname,
      customerName: lead.companyname,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }
    opps.unshift(newOpp)
    this.saveOpportunitiesToStorage(opps)
    return newOpp
  }
}
