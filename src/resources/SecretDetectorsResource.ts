import type { RequestFn, RequestListFn } from './types';
import type { SecretDetector, ListDetectorsParams } from '../domain/Detector';
import type { GitGuardianPagedResponse } from '../domain/Pagination';

/**
 * Access to GitGuardian secret detectors metadata (`/v1/secret_detectors`).
 */
export class SecretDetectorsResource {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
  ) {}

  /**
   * Lists all available secret detectors.
   *
   * `GET /v1/secret_detectors`
   */
  async list(
    params?: ListDetectorsParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<SecretDetector>> {
    return this.requestList<SecretDetector>(
      '/v1/secret_detectors',
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Retrieves details for a specific detector.
   *
   * `GET /v1/secret_detectors/{detector_name}`
   */
  async get(name: string, signal?: AbortSignal): Promise<SecretDetector> {
    return this.request<SecretDetector>(
      `/v1/secret_detectors/${encodeURIComponent(name)}`,
      undefined,
      signal,
    );
  }
}
