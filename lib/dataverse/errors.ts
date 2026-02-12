/**
 * Typed error classes for Dataverse API operations.
 */

export class DataverseApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'DataverseApiError'
  }

  get isUnauthorized() {
    return this.status === 401
  }

  get isForbidden() {
    return this.status === 403
  }

  get isNotFound() {
    return this.status === 404
  }

  get isConflict() {
    return this.status === 409
  }

  get isRateLimited() {
    return this.status === 429
  }
}

export class DataverseNetworkError extends Error {
  constructor(message = 'Network error: unable to reach Dataverse') {
    super(message)
    this.name = 'DataverseNetworkError'
  }
}

export class DataverseAuthError extends Error {
  constructor(message = 'Authentication failed: unable to acquire token') {
    super(message)
    this.name = 'DataverseAuthError'
  }
}

export function parseDataverseError(status: number, body: unknown): DataverseApiError {
  if (typeof body === 'object' && body !== null) {
    const err = body as Record<string, unknown>
    const inner = err.error as Record<string, unknown> | undefined
    return new DataverseApiError(
      (inner?.message as string) || `Dataverse API error (${status})`,
      status,
      inner?.code as string | undefined,
      inner
    )
  }
  return new DataverseApiError(`Dataverse API error (${status})`, status)
}
