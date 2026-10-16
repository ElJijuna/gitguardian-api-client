import type { RequestFn, RequestListFn } from './types';
import type { Source, ListSourcesParams } from '../domain/Source';
import type { GitGuardianPagedResponse } from '../domain/Pagination';

/**
 * Access to GitGuardian monitored sources collection (`/v1/sources`).
 */
export class SourcesResource {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
  ) {}

  /**
   * Lists monitored repositories and data sources.
   *
   * `GET /v1/sources`
   */
  async list(
    params?: ListSourcesParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<Source>> {
    return this.requestList<Source>(
      '/v1/sources',
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Retrieves a specific source by numeric ID.
   *
   * `GET /v1/sources/{id}`
   */
  async get(id: number, signal?: AbortSignal): Promise<Source> {
    return this.request<Source>(`/v1/sources/${encodeURIComponent(id)}`, undefined, signal);
  }
}
