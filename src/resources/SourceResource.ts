import type { RequestFn, RequestListFn, RequestPatchFn } from './types';
import type { Source, UpdateSourceData } from '../domain/Source';
import type { SecretIncident, IncidentLocation } from '../domain/Incident';
import type { GitGuardianPagedResponse, PaginationParams } from '../domain/Pagination';

/**
 * Represents a monitored repository or VCS source.
 *
 * Implements `PromiseLike<Source>` so it can be awaited directly
 * to fetch source details, or chained to inspect incidents or update monitoring.
 *
 * @example
 * ```typescript
 * const src = await gg.source(42);
 * const incidents = await gg.source(42).incidents();
 * await gg.source(42).update({ monitored: false });
 * ```
 */
export class SourceResource implements PromiseLike<Source> {
  private readonly basePath: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
    private readonly patch: RequestPatchFn,
    private readonly id: number,
  ) {
    this.basePath = `/v1/sources/${encodeURIComponent(id)}`;
  }

  /**
   * Allows the source resource to be awaited directly.
   */
  then<TResult1 = Source, TResult2 = never>(
    onfulfilled?: ((value: Source) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    // eslint-disable-next-line no-restricted-syntax
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Retrieves source details.
   *
   * `GET /v1/sources/{id}`
   */
  async get(signal?: AbortSignal): Promise<Source> {
    return this.request<Source>(this.basePath, undefined, signal);
  }

  /**
   * Updates source monitoring status.
   *
   * `PATCH /v1/sources/{id}`
   */
  async update(data: UpdateSourceData, signal?: AbortSignal): Promise<Source> {
    return this.patch<Source>(this.basePath, data, signal);
  }

  /**
   * Lists secret incidents detected on this source.
   *
   * `GET /v1/sources/{id}/incidents/secrets`
   */
  async incidents(
    params?: PaginationParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<SecretIncident>> {
    return this.requestList<SecretIncident>(
      `${this.basePath}/incidents/secrets`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Lists detected secret locations on this source.
   *
   * `GET /v1/sources/{id}/locations`
   */
  async locations(
    params?: PaginationParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<IncidentLocation>> {
    return this.requestList<IncidentLocation>(
      `${this.basePath}/locations`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }
}
