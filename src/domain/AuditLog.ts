import type { PaginationParams } from './Pagination';

/**
 * Audit log entry tracking actions performed across the GitGuardian workspace.
 */
export interface AuditLog {
  id: number;
  date: string;
  member_name?: string;
  member_email?: string;
  action_type: string;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Query parameters for listing workspace audit logs (`GET /v1/audit_logs`).
 */
export interface ListAuditLogsParams extends PaginationParams {
  date_after?: string;
  date_before?: string;
  member_email?: string;
  action_type?: string;
}
