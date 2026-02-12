/**
 * Fluent OData query builder for Dataverse Web API.
 */

export class RequestBuilder {
  private _select: string[] = []
  private _filter: string[] = []
  private _expand: string[] = []
  private _orderby: string[] = []
  private _top?: number
  private _skip?: number
  private _count = false
  private _search?: string

  select(...fields: string[]): this {
    this._select.push(...fields)
    return this
  }

  filter(expression: string): this {
    this._filter.push(expression)
    return this
  }

  expand(nav: string, innerSelect?: string[]): this {
    if (innerSelect && innerSelect.length > 0) {
      this._expand.push(`${nav}($select=${innerSelect.join(',')})`)
    } else {
      this._expand.push(nav)
    }
    return this
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this._orderby.push(`${field} ${direction}`)
    return this
  }

  top(n: number): this {
    this._top = n
    return this
  }

  skip(n: number): this {
    this._skip = n
    return this
  }

  count(enabled = true): this {
    this._count = enabled
    return this
  }

  search(term: string): this {
    this._search = term
    return this
  }

  build(): string {
    const params: string[] = []

    if (this._select.length > 0) {
      params.push(`$select=${this._select.join(',')}`)
    }
    if (this._filter.length > 0) {
      params.push(`$filter=${this._filter.join(' and ')}`)
    }
    if (this._expand.length > 0) {
      params.push(`$expand=${this._expand.join(',')}`)
    }
    if (this._orderby.length > 0) {
      params.push(`$orderby=${this._orderby.join(',')}`)
    }
    if (this._top !== undefined) {
      params.push(`$top=${this._top}`)
    }
    if (this._skip !== undefined) {
      params.push(`$skip=${this._skip}`)
    }
    if (this._count) {
      params.push('$count=true')
    }
    if (this._search) {
      params.push(`$search="${encodeURIComponent(this._search)}"`)
    }

    return params.length > 0 ? `?${params.join('&')}` : ''
  }

  /**
   * Generate an @odata.bind reference for relationship binding.
   * e.g., odataBind('leads', 'abc-123') => '/leads(abc-123)'
   */
  static odataBind(entitySet: string, id: string): string {
    return `/${entitySet}(${id})`
  }
}
