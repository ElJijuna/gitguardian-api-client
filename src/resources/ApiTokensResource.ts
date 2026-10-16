import type { RequestFn, RequestListFn, RequestBodyFn, RequestDeleteFn } from './types';
import type { ApiToken, CreateApiTokenData, ListApiTokensParams } from '../domain/ApiToken';
import type { GitGuardianPagedResponse } from '../domain/Pagination';

/**
 * Access to GitGuardian API tokens management (`/v1/api_tokens`).
 */
export class ApiTokensResource {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
    private readonly post: RequestBodyFn,
    private readonly del: RequestDeleteFn,
  ) {}

  /**
   * Retrieves information about the current API token making the request.
   *
   * `GET /v1/api_tokens/self`
   */
  async self(signal?: AbortSignal): Promise<ApiToken> {
    return this.request<ApiToken>('/v1/api_tokens/self', undefined, signal);
  }

  /**
   * Lists API tokens in the workspace.
   *
   * `GET /v1/api_tokens`
   */
  async list(
    params?: ListApiTokensParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<ApiToken>> {
    return this.requestList<ApiToken>(
      '/v1/api_tokens',
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Creates a new API token.
   *
   * `POST /v1/api_tokens`
   */
  async create(data: CreateApiTokenData, signal?: AbortSignal): Promise<ApiToken> {
    return this.post<ApiToken>('/v1/api_tokens', data, signal);
  }

  /**
   * Retrieves an API token by ID.
   *
   * `GET /v1/api_tokens/{id}`
   */
  async get(id: string, signal?: AbortSignal): Promise<ApiToken> {
    return this.request<ApiToken>(`/v1/api_tokens/${encodeURIComponent(id)}`, undefined, signal);
  }

  /**
   * Revokes/deletes an API token.
   *
   * `DELETE /v1/api_tokens/{id}`
   */
  async delete(id: string, signal?: AbortSignal): Promise<void> {
    return this.del(`/v1/api_tokens/${encodeURIComponent(id)}`, signal);
  }
}
