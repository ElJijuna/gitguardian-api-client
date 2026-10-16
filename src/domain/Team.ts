import type { PaginationParams } from './Pagination';

/**
 * Team entity within a GitGuardian workspace.
 */
export interface Team {
  /** Numeric ID of the team */
  id: number;
  /** Team name */
  name: string;
  /** Optional description */
  description?: string | null;
  /** Whether the team has global access to all sources and incidents */
  is_global?: boolean;
  [key: string]: unknown;
}

/**
 * Request payload for creating a new team (`POST /v1/teams`).
 */
export interface CreateTeamData {
  /** Name of the team */
  name: string;
  /** Description of the team */
  description?: string;
  /** Whether the team has global access */
  is_global?: boolean;
}

/**
 * Request payload for updating team information (`PATCH /v1/teams/{id}`).
 */
export interface UpdateTeamData {
  name?: string;
  description?: string;
}

/**
 * Query parameters for listing teams (`GET /v1/teams`).
 */
export interface ListTeamsParams extends PaginationParams {
  search?: string;
}
