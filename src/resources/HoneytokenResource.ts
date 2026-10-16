import type { RequestFn, RequestListFn, RequestBodyFn, RequestPatchFn } from './types';
import type { Honeytoken, UpdateHoneytokenData, HoneytokenEvent } from '../domain/Honeytoken';
import type { IncidentNote } from '../domain/Incident';
import type { GitGuardianPagedResponse, PaginationParams } from '../domain/Pagination';

/**
 * Represents a single GitGuardian honeytoken (decoy credential).
 *
 * Implements `PromiseLike<Honeytoken>` so it can be awaited directly
 * to fetch details, or chained to reset, revoke, or inspect trigger events.
 *
 * @example
 * ```typescript
 * const token = await gg.honeytoken('uuid-1234');
 * await gg.honeytoken('uuid-1234').revoke();
 * const events = await gg.honeytoken('uuid-1234').events();
 * ```
 */
export class HoneytokenResource implements PromiseLike<Honeytoken> {
  private readonly basePath: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
    private readonly post: RequestBodyFn,
    private readonly patch: RequestPatchFn,
    private readonly id: string,
  ) {
    this.basePath = `/v1/honeytokens/${encodeURIComponent(id)}`;
  }

  /**
   * Allows the honeytoken resource to be awaited directly.
   */
  then<TResult1 = Honeytoken, TResult2 = never>(
    onfulfilled?: ((value: Honeytoken) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    // eslint-disable-next-line no-restricted-syntax
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Retrieves details for this honeytoken.
   *
   * `GET /v1/honeytokens/{id}`
   */
  async get(signal?: AbortSignal): Promise<Honeytoken> {
    return this.request<Honeytoken>(this.basePath, undefined, signal);
  }

  /**
   * Updates name or description of this honeytoken.
   *
   * `PATCH /v1/honeytokens/{id}`
   */
  async update(data: UpdateHoneytokenData, signal?: AbortSignal): Promise<Honeytoken> {
    return this.patch<Honeytoken>(this.basePath, data, signal);
  }

  /**
   * Resets this honeytoken's triggered events state.
   *
   * `POST /v1/honeytokens/{id}/reset`
   */
  async reset(signal?: AbortSignal): Promise<Honeytoken> {
    return this.post<Honeytoken>(`${this.basePath}/reset`, {}, signal);
  }

  /**
   * Revokes this honeytoken.
   *
   * `POST /v1/honeytokens/{id}/revoke`
   */
  async revoke(signal?: AbortSignal): Promise<Honeytoken> {
    return this.post<Honeytoken>(`${this.basePath}/revoke`, {}, signal);
  }

  /**
   * Lists access trigger events for this honeytoken.
   *
   * `GET /v1/honeytokens_events?honeytoken_id={id}`
   */
  async events(
    params?: PaginationParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<HoneytokenEvent>> {
    const query = {
      ...params,
      honeytoken_id: this.id,
    } as Record<string, string | number | boolean>;
    return this.requestList<HoneytokenEvent>('/v1/honeytokens_events', query, signal);
  }

  /**
   * Lists notes attached to this honeytoken.
   *
   * `GET /v1/honeytokens/{id}/notes`
   */
  async notes(signal?: AbortSignal): Promise<IncidentNote[]> {
    return this.request<IncidentNote[]>(`${this.basePath}/notes`, undefined, signal);
  }

  /**
   * Adds a note to this honeytoken.
   *
   * `POST /v1/honeytokens/{id}/notes`
   */
  async addNote(comment: string, signal?: AbortSignal): Promise<IncidentNote> {
    return this.post<IncidentNote>(`${this.basePath}/notes`, { comment }, signal);
  }
}
