import type {
  RequestFn,
  RequestListFn,
  RequestBodyFn,
  RequestPatchFn,
  RequestDeleteFn,
} from './types';
import type { Team, CreateTeamData, UpdateTeamData, ListTeamsParams } from '../domain/Team';
import type { Source } from '../domain/Source';
import type { SecretIncident } from '../domain/Incident';
import type { GitGuardianPagedResponse, PaginationParams } from '../domain/Pagination';

/**
 * Access to GitGuardian teams collection (`/v1/teams`).
 */
export class TeamsResource {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
    private readonly post: RequestBodyFn,
    private readonly patch: RequestPatchFn,
    private readonly del: RequestDeleteFn,
  ) {}

  /**
   * Lists teams in the workspace.
   *
   * `GET /v1/teams`
   */
  async list(
    params?: ListTeamsParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<Team>> {
    return this.requestList<Team>(
      '/v1/teams',
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Creates a new team.
   *
   * `POST /v1/teams`
   */
  async create(data: CreateTeamData, signal?: AbortSignal): Promise<Team> {
    return this.post<Team>('/v1/teams', data, signal);
  }

  /**
   * Retrieves a team by ID.
   *
   * `GET /v1/teams/{id}`
   */
  async get(id: number, signal?: AbortSignal): Promise<Team> {
    return this.request<Team>(`/v1/teams/${encodeURIComponent(id)}`, undefined, signal);
  }

  /**
   * Updates an existing team.
   *
   * `PATCH /v1/teams/{id}`
   */
  async update(id: number, data: UpdateTeamData, signal?: AbortSignal): Promise<Team> {
    return this.patch<Team>(`/v1/teams/${encodeURIComponent(id)}`, data, signal);
  }

  /**
   * Deletes a team.
   *
   * `DELETE /v1/teams/{id}`
   */
  async delete(id: number, signal?: AbortSignal): Promise<void> {
    return this.del(`/v1/teams/${encodeURIComponent(id)}`, signal);
  }

  /**
   * Lists sources associated with this team.
   *
   * `GET /v1/teams/{id}/sources`
   */
  async sources(
    id: number,
    params?: PaginationParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<Source>> {
    return this.requestList<Source>(
      `/v1/teams/${encodeURIComponent(id)}/sources`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Lists secret incidents associated with this team.
   *
   * `GET /v1/teams/{id}/incidents/secrets`
   */
  async incidents(
    id: number,
    params?: PaginationParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<SecretIncident>> {
    return this.requestList<SecretIncident>(
      `/v1/teams/${encodeURIComponent(id)}/incidents/secrets`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }
}
