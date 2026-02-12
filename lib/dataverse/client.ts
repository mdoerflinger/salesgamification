/**
 * DataverseClient: typed HTTP client for Dataverse Web API (OData v4).
 * Handles token injection, 401 retry, and error parsing.
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
import { env } from '@/lib/config/env'
import { ODATA_HEADERS, DEFAULT_PAGE_SIZE } from '@/lib/config/constants'
import { RequestBuilder } from './request-builder'
import {
  DataverseApiError,
  DataverseNetworkError,
  DataverseAuthError,
  parseDataverseError,
} from './errors'

type TokenAcquirer = () => Promise<string>

export class DataverseClient {
  private baseUrl: string
  private getToken: TokenAcquirer

  constructor(getToken: TokenAcquirer) {
    this.baseUrl = env.dataverseBaseUrl()
    this.getToken = getToken
  }

  // ── Private request method with 401 retry ──

  private async request<T>(
    path: string,
    options: RequestInit = {},
    retry = true
  ): Promise<T> {
    let token: string
    try {
      token = await this.getToken()
    } catch {
      throw new DataverseAuthError()
    }

    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      ...ODATA_HEADERS,
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    }

    let response: Response
    try {
      response = await fetch(url, { ...options, headers })
    } catch {
      throw new DataverseNetworkError()
    }

    // 401: try silent token refresh once
    if (response.status === 401 && retry) {
      return this.request<T>(path, options, false)
    }

    // 204 No Content (e.g., PATCH success)
    if (response.status === 204) {
      return undefined as T
    }

    const body = await response.json().catch(() => null)

    if (!response.ok) {
      throw parseDataverseError(response.status, body)
    }

    return body as T
  }

  // ── Leads ──

  async createLead(payload: LeadCreateDto): Promise<LeadEntity> {
    // Auto-compute fullname if not provided
    const body = { ...payload }

    return this.request<LeadEntity>('/leads', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async updateLead(id: string, patch: LeadUpdateDto): Promise<void> {
    return this.request<void>(`/leads(${id})`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
  }

  async getLead(id: string): Promise<LeadEntity> {
    const query = new RequestBuilder()
      .select(
        'leadid',
        'fullname',
        'firstname',
        'lastname',
        'companyname',
        'emailaddress1',
        'mobilephone',
        'telephone1',
        'jobtitle',
        'leadsourcecode',
        'statuscode',
        'statecode',
        'subject',
        'description',
        'revenue',
        'createdon',
        'modifiedon',
        '_ownerid_value'
      )
      .build()

    return this.request<LeadEntity>(`/leads(${id})${query}`)
  }

  async getLeads(opts: {
    top?: number
    search?: string
    filter?: string
    orderBy?: string
  } = {}): Promise<ODataCollectionResponse<LeadEntity>> {
    const builder = new RequestBuilder()
      .select(
        'leadid',
        'fullname',
        'firstname',
        'lastname',
        'companyname',
        'emailaddress1',
        'mobilephone',
        'jobtitle',
        'leadsourcecode',
        'statuscode',
        'statecode',
        'createdon',
        'modifiedon'
      )
      .top(opts.top ?? DEFAULT_PAGE_SIZE)
      .orderBy(opts.orderBy ?? 'createdon', 'desc')

    if (opts.filter) {
      builder.filter(opts.filter)
    }
    if (opts.search) {
      builder.filter(
        `contains(fullname,'${opts.search}') or contains(companyname,'${opts.search}')`
      )
    }

    return this.request<ODataCollectionResponse<LeadEntity>>(
      `/leads${builder.build()}`
    )
  }

  // ── Tasks / Follow-ups ──

  async createTaskFollowUp(
    leadId: string,
    dto: TaskCreateDto
  ): Promise<TaskEntity> {
    const body = {
      ...dto,
      'regardingobjectid_lead@odata.bind': RequestBuilder.odataBind(
        'leads',
        leadId
      ),
    }

    return this.request<TaskEntity>('/tasks', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async completeTask(taskId: string): Promise<void> {
    return this.request<void>(`/tasks(${taskId})`, {
      method: 'PATCH',
      body: JSON.stringify({ statecode: 1, statuscode: 5 }),
    })
  }

  async getLeadTasks(
    leadId: string,
    top = 20
  ): Promise<ODataCollectionResponse<TaskEntity>> {
    const query = new RequestBuilder()
      .select(
        'activityid',
        'subject',
        'description',
        'scheduledstart',
        'scheduledend',
        'prioritycode',
        'statecode',
        'statuscode',
        'createdon',
        'modifiedon',
        '_regardingobjectid_value'
      )
      .filter(`_regardingobjectid_value eq '${leadId}'`)
      .orderBy('scheduledend', 'asc')
      .top(top)
      .build()

    return this.request<ODataCollectionResponse<TaskEntity>>(
      `/tasks${query}`
    )
  }

  // ── Activities (generic) ──

  async listLeadActivities(
    leadId: string,
    top = 20
  ): Promise<ODataCollectionResponse<ActivityEntity>> {
    const query = new RequestBuilder()
      .select(
        'activityid',
        'activitytypecode',
        'subject',
        'description',
        'scheduledstart',
        'scheduledend',
        'actualstart',
        'actualend',
        'statecode',
        'statuscode',
        'createdon',
        'modifiedon'
      )
      .filter(`_regardingobjectid_value eq '${leadId}'`)
      .orderBy('createdon', 'desc')
      .top(top)
      .build()

    return this.request<ODataCollectionResponse<ActivityEntity>>(
      `/activitypointers${query}`
    )
  }
}
