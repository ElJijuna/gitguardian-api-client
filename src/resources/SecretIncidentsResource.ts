import type { RequestFn, RequestListFn } from './types';
import type { SecretIncident, ListIncidentsParams } from '../domain/Incident';
import type { GitGuardianPagedResponse } from '../domain/Pagination';

/**
 * Access to GitGuardian secret incidents collection (`/v1/incidents/secrets`).
 */
export class SecretIncidentsResource {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
  ) {}

  /**
   * Lists secret incidents with optional filtering by status, severity, tags, date range, and cursor pagination.
   *
   * `GET /v1/incidents/secrets`
   *
   * @param params - Optional query filters and pagination params
   * @param signal - Optional AbortSignal
   */
  async list(
    params?: ListIncidentsParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<SecretIncident>> {
    return this.requestList<SecretIncident>(
      '/v1/incidents/secrets',
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Retrieves a specific incident by ID.
   *
   * `GET /v1/incidents/secrets/{id}`
   *
   * @param id - Numeric incident ID
   * @param signal - Optional AbortSignal
   */
  async get(id: number, signal?: AbortSignal): Promise<SecretIncident> {
    return this.request<SecretIncident>(
      `/v1/incidents/secrets/${encodeURIComponent(id)}`,
      undefined,
      signal,
    );
  }
}
