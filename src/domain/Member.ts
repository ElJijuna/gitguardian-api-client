import type { PaginationParams } from './Pagination';

/**
 * Workspace member role.
 */
export type MemberRole = 'owner' | 'manager' | 'member' | 'restricted' | string;

/**
 * Workspace member in GitGuardian.
 */
export interface Member {
  /** Member numeric ID */
  id: number;
  /** Member full name */
  name: string;
  /** Member email address */
  email: string;
  /** Access role */
  role?: MemberRole;
  /** ISO timestamp when member was added */
  created_at?: string;
  [key: string]: unknown;
}

/**
 * Query parameters for listing workspace members (`GET /v1/members`).
 */
export interface ListMembersParams extends PaginationParams {
  /** Search by name or email */
  search?: string;
  /** Filter by member role */
  role?: MemberRole;
}
