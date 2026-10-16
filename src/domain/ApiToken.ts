import type { PaginationParams } from './Pagination';

/**
 * GitGuardian API token details.
 */
export interface ApiToken {
  /** Token identifier UUID */
  id: string;
  /** Name / description */
  name: string;
  /** Type of token ('personal_access_token' or 'service_account') */
  type?: string;
  /** ISO timestamp when token was created */
  created_at: string;
  /** ISO timestamp when token expires, if set */
  expire_at?: string | null;
  /** Permissions granted to this token */
  scopes?: string[];
  [key: string]: unknown;
}

/**
 * Request payload for creating an API token (`POST /v1/api_tokens`).
 */
export interface CreateApiTokenData {
  name: string;
  scopes?: string[];
}

/**
 * Query parameters for listing API tokens (`GET /v1/api_tokens`).
 */
export interface ListApiTokensParams extends PaginationParams {
  search?: string;
}
