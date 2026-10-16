import type { RequestFn, RequestListFn } from './types';
import type { AuditLog, ListAuditLogsParams } from '../domain/AuditLog';
import type { GitGuardianPagedResponse } from '../domain/Pagination';

/**
 * Access to workspace audit logs (`/v1/audit_logs`).
 */
export class AuditLogsResource {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
  ) {}

  /**
   * Lists audit logs for the workspace.
   *
   * `GET /v1/audit_logs`
   */
  async list(
    params?: ListAuditLogsParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<AuditLog>> {
    return this.requestList<AuditLog>(
      '/v1/audit_logs',
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Lists all available audit log event names.
   *
   * `GET /v1/audit_logs/event_names`
   */
  async eventNames(signal?: AbortSignal): Promise<string[]> {
    return this.request<string[]>('/v1/audit_logs/event_names', undefined, signal);
  }
}
