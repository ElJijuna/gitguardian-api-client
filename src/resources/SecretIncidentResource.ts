import type {
  RequestFn,
  RequestListFn,
  RequestBodyFn,
  RequestPatchFn,
  RequestDeleteFn,
} from './types';
import type {
  SecretIncident,
  IncidentNote,
  IncidentActivityLog,
  IncidentLocation,
  ResolveIncidentData,
  IgnoreIncidentData,
  AssignIncidentData,
  ShareIncidentData,
} from '../domain/Incident';
import type { GitGuardianPagedResponse, PaginationParams } from '../domain/Pagination';

/**
 * Represents a single GitGuardian secret incident.
 *
 * Implements `PromiseLike<SecretIncident>` so it can be awaited directly
 * to fetch incident details, or chained to execute remediation actions or access sub-resources.
 *
 * @example
 * ```typescript
 * // Direct await
 * const incident = await gg.incident(12345);
 *
 * // Remediation actions
 * await gg.incident(12345).resolve({ secret_revoked: true });
 * await gg.incident(12345).ignore({ ignore_reason: 'false_positive' });
 *
 * // Incident notes
 * const notes = await gg.incident(12345).notes();
 * await gg.incident(12345).addNote('Investigated with security team: confirmed revoked');
 * ```
 */
export class SecretIncidentResource implements PromiseLike<SecretIncident> {
  private readonly basePath: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
    private readonly post: RequestBodyFn,
    private readonly patch: RequestPatchFn,
    private readonly del: RequestDeleteFn,
    private readonly id: number,
  ) {
    this.basePath = `/v1/incidents/secrets/${encodeURIComponent(id)}`;
  }

  /**
   * Allows the incident resource to be awaited directly, resolving with incident details.
   */
  then<TResult1 = SecretIncident, TResult2 = never>(
    onfulfilled?: ((value: SecretIncident) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    // eslint-disable-next-line no-restricted-syntax
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches full incident details.
   *
   * `GET /v1/incidents/secrets/{id}`
   */
  async get(signal?: AbortSignal): Promise<SecretIncident> {
    return this.request<SecretIncident>(this.basePath, undefined, signal);
  }

  /**
   * Resolves the incident.
   *
   * `POST /v1/incidents/secrets/{id}/resolve`
   */
  async resolve(data: ResolveIncidentData = {}, signal?: AbortSignal): Promise<SecretIncident> {
    return this.post<SecretIncident>(`${this.basePath}/resolve`, data, signal);
  }

  /**
   * Ignores the incident.
   *
   * `POST /v1/incidents/secrets/{id}/ignore`
   */
  async ignore(data: IgnoreIncidentData = {}, signal?: AbortSignal): Promise<SecretIncident> {
    return this.post<SecretIncident>(`${this.basePath}/ignore`, data, signal);
  }

  /**
   * Reopens an ignored or resolved incident.
   *
   * `POST /v1/incidents/secrets/{id}/reopen`
   */
  async reopen(signal?: AbortSignal): Promise<SecretIncident> {
    return this.post<SecretIncident>(`${this.basePath}/reopen`, {}, signal);
  }

  /**
   * Assigns the incident to a workspace member.
   *
   * `POST /v1/incidents/secrets/{id}/assign`
   */
  async assign(data: AssignIncidentData, signal?: AbortSignal): Promise<SecretIncident> {
    return this.post<SecretIncident>(`${this.basePath}/assign`, data, signal);
  }

  /**
   * Unassigns the incident.
   *
   * `POST /v1/incidents/secrets/{id}/unassign`
   */
  async unassign(signal?: AbortSignal): Promise<SecretIncident> {
    return this.post<SecretIncident>(`${this.basePath}/unassign`, {}, signal);
  }

  /**
   * Creates a public shareable URL for the incident.
   *
   * `POST /v1/incidents/secrets/{id}/share`
   */
  async share(data: ShareIncidentData = {}, signal?: AbortSignal): Promise<{ share_url: string }> {
    return this.post<{ share_url: string }>(`${this.basePath}/share`, data, signal);
  }

  /**
   * Revokes the public shareable URL for the incident.
   *
   * `POST /v1/incidents/secrets/{id}/unshare`
   */
  async unshare(signal?: AbortSignal): Promise<void> {
    return this.post<void>(`${this.basePath}/unshare`, {}, signal);
  }

  /**
   * Lists all remediation notes attached to this incident.
   *
   * `GET /v1/incidents/secrets/{id}/notes`
   */
  async notes(signal?: AbortSignal): Promise<IncidentNote[]> {
    return this.request<IncidentNote[]>(`${this.basePath}/notes`, undefined, signal);
  }

  /**
   * Adds a new note to this incident.
   *
   * `POST /v1/incidents/secrets/{id}/notes`
   */
  async addNote(comment: string, signal?: AbortSignal): Promise<IncidentNote> {
    return this.post<IncidentNote>(`${this.basePath}/notes`, { comment }, signal);
  }

  /**
   * Updates an existing note on this incident.
   *
   * `PATCH /v1/incidents/secrets/{id}/notes/{noteId}`
   */
  async updateNote(noteId: number, comment: string, signal?: AbortSignal): Promise<IncidentNote> {
    return this.patch<IncidentNote>(
      `${this.basePath}/notes/${encodeURIComponent(noteId)}`,
      { comment },
      signal,
    );
  }

  /**
   * Deletes a note from this incident.
   *
   * `DELETE /v1/incidents/secrets/{id}/notes/{noteId}`
   */
  async deleteNote(noteId: number, signal?: AbortSignal): Promise<void> {
    return this.del(`${this.basePath}/notes/${encodeURIComponent(noteId)}`, signal);
  }

  /**
   * Retrieves activity history logs for this incident.
   *
   * `GET /v1/incidents/secrets/{id}/activity-logs`
   */
  async activityLogs(
    params?: PaginationParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<IncidentActivityLog>> {
    return this.requestList<IncidentActivityLog>(
      `${this.basePath}/activity-logs`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Retrieves locations where the secret was detected.
   *
   * `GET /v1/incidents/secrets/{id}/locations`
   */
  async locations(
    params?: PaginationParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<IncidentLocation>> {
    return this.requestList<IncidentLocation>(
      `${this.basePath}/locations`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }
}
