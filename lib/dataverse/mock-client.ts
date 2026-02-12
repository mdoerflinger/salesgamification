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
  ODataCollectionResponse,
} from '@/types/dataverse'
import { DEFAULT_PAGE_SIZE } from '@/lib/config/constants'

const STORAGE_KEY = 'mock-dataverse-leads'
const STORAGE_KEY_TASKS = 'mock-dataverse-tasks'

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
    console.log('[v0] MockDataverseClient: Creating lead', payload)

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
    console.log('[v0] MockDataverseClient: Lead created', newLead)
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
    console.log('[v0] MockDataverseClient: Getting leads', opts)
    
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

    console.log('[v0] MockDataverseClient: Returning leads', leads.length)
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
}
