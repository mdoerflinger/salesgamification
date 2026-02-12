/**
 * Microsoft Dataverse entity types for the Sales Lead Coach.
 * Based on OData v4 Web API entity definitions.
 */

// ── Lead ──

export interface LeadEntity {
  leadid: string
  fullname: string
  firstname?: string
  lastname?: string
  companyname?: string
  emailaddress1?: string
  mobilephone?: string
  telephone1?: string
  jobtitle?: string
  leadsourcecode?: number
  statuscode: number
  statecode: number
  subject?: string
  description?: string
  revenue?: number
  createdon: string
  modifiedon: string
  // Computed fields
  _ownerid_value?: string
  _parentcontactid_value?: string
  _parentaccountid_value?: string
}

export interface LeadCreateDto {
  subject?: string
  firstname?: string
  lastname?: string
  companyname: string
  emailaddress1?: string
  mobilephone?: string
  telephone1?: string
  jobtitle?: string
  leadsourcecode?: number
  description?: string
  revenue?: number
}

export interface LeadUpdateDto {
  subject?: string
  firstname?: string
  lastname?: string
  companyname?: string
  emailaddress1?: string
  mobilephone?: string
  telephone1?: string
  jobtitle?: string
  leadsourcecode?: number
  statuscode?: number
  statecode?: number
  description?: string
  revenue?: number
}

// ── Task / Follow-up ──

export interface TaskEntity {
  activityid: string
  subject: string
  description?: string
  scheduledstart?: string
  scheduledend?: string
  actualstart?: string
  actualend?: string
  prioritycode: number
  statecode: number
  statuscode: number
  createdon: string
  modifiedon: string
  _ownerid_value?: string
  _regardingobjectid_value?: string
}

export interface TaskCreateDto {
  subject: string
  scheduledstart?: string
  scheduledend?: string
  description?: string
  prioritycode?: number
  /** OData bind to lead: /leads(leadid) */
  'regardingobjectid_lead@odata.bind'?: string
}

// ── Activity (generic) ──

export interface ActivityEntity {
  activityid: string
  activitytypecode: string
  subject: string
  description?: string
  scheduledstart?: string
  scheduledend?: string
  actualstart?: string
  actualend?: string
  statecode: number
  statuscode: number
  createdon: string
  modifiedon: string
  _regardingobjectid_value?: string
}

// ── Phone Call ──

export interface PhoneCallEntity {
  activityid: string
  subject: string
  phonenumber?: string
  description?: string
  directioncode: boolean
  statecode: number
  statuscode: number
  createdon: string
  _regardingobjectid_value?: string
}

// ── OData Response Wrappers ──

export interface ODataCollectionResponse<T> {
  '@odata.context'?: string
  '@odata.count'?: number
  '@odata.nextLink'?: string
  value: T[]
}

export interface ODataSingleResponse<T> extends Record<string, unknown> {
  '@odata.context'?: string
  '@odata.etag'?: string
}
