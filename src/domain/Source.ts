import type { PaginationParams } from './Pagination';

/**
 * VCS or repository source monitored by GitGuardian.
 */
export interface Source {
  /** Numeric ID of the source */
  id: number;
  /** Full repository URL on VCS host */
  url: string;
  /** VCS host type (e.g. 'github', 'gitlab', 'bitbucket') */
  type: string;
  /** Full repository name (e.g. 'org/repo') */
  full_name: string;
  /** Open incidents count on this source */
  open_incidents_count?: number;
  /** Closed incidents count on this source */
  closed_incidents_count?: number;
  /** Visibility ('public', 'private', 'internal') */
  visibility?: string;
  /** Whether the source is currently actively monitored */
  monitored?: boolean;
  /** Default branch of the source (e.g. 'main', 'master') */
  default_branch?: string;
  [key: string]: unknown;
}

/**
 * Request payload for updating source settings (`PATCH /v1/sources/{id}`).
 */
export interface UpdateSourceData {
  /** Enable or disable active scanning/monitoring for this source */
  monitored?: boolean;
}

/**
 * Query parameters for listing sources (`GET /v1/sources`).
 */
export interface ListSourcesParams extends PaginationParams {
  /** Filter by VCS type (e.g. 'github') */
  type?: string;
  /** Filter by monitoring status */
  monitored?: boolean;
  /** Search by name */
  search?: string;
  /** Filter by ordering e.g. 'full_name', '-full_name' */
  ordering?: string;
}
