import type { RequestFn, RequestListFn, RequestBodyFn } from './types';
import type {
  Honeytoken,
  CreateHoneytokenData,
  ListHoneytokensParams,
  HoneytokenEvent,
} from '../domain/Honeytoken';
import type { GitGuardianPagedResponse, PaginationParams } from '../domain/Pagination';

/**
 * Access to GitGuardian honeytokens collection (`/v1/honeytokens`).
 */
export class HoneytokensResource {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
    private readonly post: RequestBodyFn,
  ) {}

  /**
   * Lists honeytokens in the workspace.
   *
   * `GET /v1/honeytokens`
   */
  async list(
    params?: ListHoneytokensParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<Honeytoken>> {
    return this.requestList<Honeytoken>(
      '/v1/honeytokens',
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Creates a new honeytoken (decoy credential).
   *
   * `POST /v1/honeytokens`
   */
  async create(data: CreateHoneytokenData, signal?: AbortSignal): Promise<Honeytoken> {
    return this.post<Honeytoken>('/v1/honeytokens', data, signal);
  }

  /**
   * Retrieves a honeytoken by ID.
   *
   * `GET /v1/honeytokens/{id}`
   */
  async get(id: string, signal?: AbortSignal): Promise<Honeytoken> {
    return this.request<Honeytoken>(`/v1/honeytokens/${encodeURIComponent(id)}`, undefined, signal);
  }

  /**
   * Lists honeytoken trigger events across all honeytokens.
   *
   * `GET /v1/honeytokens_events`
   */
  async events(
    params?: PaginationParams,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<HoneytokenEvent>> {
    return this.requestList<HoneytokenEvent>(
      '/v1/honeytokens_events',
      params as Record<string, string | number | boolean>,
      signal,
    );
  }
}
