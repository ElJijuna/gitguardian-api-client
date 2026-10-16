import type { RequestFn, RequestListFn } from './types';
import type { SecretOccurrence, ListOccurrencesParams } from '../domain/Occurrence';
import type { GitGuardianPagedResponse } from '../domain/Pagination';

/**
 * Access to GitGuardian occurrences collection (`/v1/occurrences/secrets`).
 */
export class SecretOccurrencesResource {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
  ) {}

  /**
   * Lists secret occurrences across monitored sources.
   *
   * `GET /v1/occurrences/secrets`
   */
  async list(
    params?: ListOccurrencesParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<SecretOccurrence>> {
    return this.requestList<SecretOccurrence>(
      '/v1/occurrences/secrets',
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Retrieves details for a specific secret occurrence.
   *
   * `GET /v1/occurrences/secrets/{id}`
   */
  async get(id: number, signal?: AbortSignal): Promise<SecretOccurrence> {
    return this.request<SecretOccurrence>(
      `/v1/occurrences/secrets/${encodeURIComponent(id)}`,
      undefined,
      signal,
    );
  }
}
