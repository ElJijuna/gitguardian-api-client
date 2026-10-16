import type { RequestFn, RequestListFn } from './types';
import type { Member, ListMembersParams } from '../domain/Member';
import type { GitGuardianPagedResponse } from '../domain/Pagination';

/**
 * Access to GitGuardian workspace members collection (`/v1/members`).
 */
export class MembersResource {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
  ) {}

  /**
   * Lists workspace members.
   *
   * `GET /v1/members`
   */
  async list(
    params?: ListMembersParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<Member>> {
    return this.requestList<Member>(
      '/v1/members',
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Retrieves a member by ID.
   *
   * `GET /v1/members/{id}`
   */
  async get(id: number, signal?: AbortSignal): Promise<Member> {
    return this.request<Member>(`/v1/members/${encodeURIComponent(id)}`, undefined, signal);
  }
}
