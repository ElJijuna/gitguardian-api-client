import { Security, DEFAULT_GITGUARDIAN_API_URL } from './security/Security';
import { GitGuardianApiError } from './errors/GitGuardianApiError';
import type { GitGuardianPagedResponse } from './domain/Pagination';
import type { HealthStatus, QuotaOverview, GitGuardianIps } from './domain/Health';
import { ScanResource } from './resources/ScanResource';
import { SecretIncidentsResource } from './resources/SecretIncidentsResource';
import { SecretIncidentResource } from './resources/SecretIncidentResource';
import { SecretOccurrencesResource } from './resources/SecretOccurrencesResource';
import { SourcesResource } from './resources/SourcesResource';
import { SourceResource } from './resources/SourceResource';
import { HoneytokensResource } from './resources/HoneytokensResource';
import { HoneytokenResource } from './resources/HoneytokenResource';
import { MembersResource } from './resources/MembersResource';
import { TeamsResource } from './resources/TeamsResource';
import { AuditLogsResource } from './resources/AuditLogsResource';
import { SecretDetectorsResource } from './resources/SecretDetectorsResource';
import { ApiTokensResource } from './resources/ApiTokensResource';
import type {
  RequestFn,
  RequestListFn,
  RequestBodyFn,
  RequestPatchFn,
  RequestPutFn,
  RequestDeleteFn,
} from './resources/types';

/**
 * Payload emitted on every HTTP request performed by {@link GitGuardianClient}.
 */
export interface RequestEvent {
  /** Full URL requested */
  url: string;
  /** HTTP method */
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  /** Timestamp when the request started */
  startedAt: Date;
  /** Timestamp when the request completed */
  finishedAt: Date;
  /** Duration in milliseconds */
  durationMs: number;
  /** HTTP response status code, if a response was received */
  statusCode?: number;
  /** Error thrown, if the request failed */
  error?: Error;
}

/**
 * Event callbacks supported by {@link GitGuardianClient}.
 */
export interface GitGuardianClientEvents {
  request: (event: RequestEvent) => void;
}

/**
 * Constructor options for {@link GitGuardianClient}.
 */
export interface GitGuardianClientOptions {
  /**
   * GitGuardian API key (Personal Access Token or Service Account token).
   * If omitted, falls back to `process.env.GITGUARDIAN_API_KEY`.
   */
  apiKey?: string;
  /**
   * Base URL of the GitGuardian API.
   * Defaults to `'https://api.gitguardian.com'`.
   * For EU region, use `'https://api.eu1.gitguardian.com'`.
   * For on-premise instances, use your custom domain (e.g. `'https://gitguardian.mycompany.com/exposed'`).
   */
  apiUrl?: string;
  /**
   * Custom fetch function (useful for testing or custom agent proxies).
   */
  fetch?: typeof fetch;
}

const NEXT_LINK_RE = /<([^>]+)>;\s*rel="next"/i;

/**
 * Parses the next page URL and cursor from GitGuardian's `Link` response header.
 * @internal
 */
export function parseNextLink(linkHeader?: string | null): {
  nextUrl?: string;
  nextCursor?: string;
} {
  if (!linkHeader) return {};
  const match = NEXT_LINK_RE.exec(linkHeader);
  if (!match) return {};
  const [, nextUrl] = match;
  try {
    const parsed = new URL(nextUrl);
    const cursor = parsed.searchParams.get('cursor') ?? undefined;
    return { nextUrl, nextCursor: cursor };
  } catch {
    const cursorMatch = /[?&]cursor=([^&>]+)/.exec(nextUrl);
    return {
      nextUrl,
      nextCursor: cursorMatch ? decodeURIComponent(cursorMatch[1]) : undefined,
    };
  }
}

/**
 * Serializes query parameters into a full URL.
 * @internal
 */
export function buildUrl(
  base: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  if (!params) return base;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  if (!queryString) return base;

  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}${queryString}`;
}

async function readResponseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    return text || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Main entry point for the GitGuardian REST API client.
 *
 * @example
 * ```typescript
 * import { GitGuardianClient } from 'gitguardian-api-client';
 *
 * const gg = new GitGuardianClient({ apiKey: 'YOUR_API_KEY' });
 *
 * // Health & Quotas
 * const health = await gg.health();
 * const quota = await gg.quotas();
 *
 * // Content Scanning
 * const scan = await gg.scan.text("API_KEY='12345'", "config.py");
 *
 * // Incidents
 * const incidents = await gg.incidents.list({ status: 'TRIGGERED' });
 * const incident = await gg.incident(42);
 * await gg.incident(42).resolve({ secret_revoked: true });
 *
 * // Honeytokens
 * const token = await gg.honeytokens.create({ name: 'Prod DB Canary', type: 'AWS' });
 * ```
 */
export class GitGuardianClient {
  private readonly security: Security;
  private readonly customFetch?: typeof fetch;
  private readonly listeners: Map<
    keyof GitGuardianClientEvents,
    GitGuardianClientEvents[keyof GitGuardianClientEvents][]
  > = new Map();

  /** Content scanning resource */
  readonly scan: ScanResource;
  /** Secret incidents collection */
  readonly incidents: SecretIncidentsResource;
  /** Secret occurrences collection */
  readonly occurrences: SecretOccurrencesResource;
  /** Monitored sources/repositories collection */
  readonly sources: SourcesResource;
  /** Decoy honeytokens collection */
  readonly honeytokens: HoneytokensResource;
  /** Workspace members collection */
  readonly members: MembersResource;
  /** Workspace teams collection */
  readonly teams: TeamsResource;
  /** Workspace audit logs collection */
  readonly auditLogs: AuditLogsResource;
  /** Secret detectors metadata */
  readonly secretDetectors: SecretDetectorsResource;
  /** API token management */
  readonly apiTokens: ApiTokensResource;

  private readonly requestFn: RequestFn = <T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    signal?: AbortSignal,
  ) => this.request<T>(path, params, signal);

  private readonly requestListFn: RequestListFn = <T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    signal?: AbortSignal,
  ) => this.requestList<T>(path, params, signal);

  private readonly requestBodyFn: RequestBodyFn = <T>(
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ) => this.requestBody<T>('POST', path, body, signal);

  private readonly requestPatchFn: RequestPatchFn = <T>(
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ) => this.requestBody<T>('PATCH', path, body, signal);

  private readonly requestPutFn: RequestPutFn = <T>(
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ) => this.requestBody<T>('PUT', path, body, signal);

  private readonly requestDeleteFn: RequestDeleteFn = (path: string, signal?: AbortSignal) =>
    this.requestDelete(path, signal);

  /**
   * @param options - Configuration options for API key, base URL, and fetch override
   */
  constructor(options: GitGuardianClientOptions = {}) {
    this.security = new Security(options.apiKey, options.apiUrl ?? DEFAULT_GITGUARDIAN_API_URL);
    this.customFetch = options.fetch;

    this.scan = new ScanResource(this.requestBodyFn);
    this.incidents = new SecretIncidentsResource(this.requestFn, this.requestListFn);
    this.occurrences = new SecretOccurrencesResource(this.requestFn, this.requestListFn);
    this.sources = new SourcesResource(this.requestFn, this.requestListFn);
    this.honeytokens = new HoneytokensResource(
      this.requestFn,
      this.requestListFn,
      this.requestBodyFn,
    );
    this.members = new MembersResource(this.requestFn, this.requestListFn);
    this.teams = new TeamsResource(
      this.requestFn,
      this.requestListFn,
      this.requestBodyFn,
      this.requestPatchFn,
      this.requestDeleteFn,
    );
    this.auditLogs = new AuditLogsResource(this.requestFn, this.requestListFn);
    this.secretDetectors = new SecretDetectorsResource(this.requestFn, this.requestListFn);
    this.apiTokens = new ApiTokensResource(
      this.requestFn,
      this.requestListFn,
      this.requestBodyFn,
      this.requestDeleteFn,
    );
  }

  /**
   * Subscribes to a client lifecycle event.
   *
   * @example
   * ```typescript
   * gg.on('request', (event) => {
   *   console.log(`${event.method} ${event.url} [${event.statusCode}] in ${event.durationMs}ms`);
   * });
   * ```
   */
  on<K extends keyof GitGuardianClientEvents>(
    event: K,
    callback: GitGuardianClientEvents[K],
  ): this {
    const list = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...list, callback]);
    return this;
  }

  /**
   * Unsubscribes a callback previously registered with {@link GitGuardianClient.on}.
   */
  off<K extends keyof GitGuardianClientEvents>(
    event: K,
    callback: GitGuardianClientEvents[K],
  ): this {
    const list = this.listeners.get(event);
    if (!list) return this;
    const index = list.lastIndexOf(callback);
    if (index === -1) return this;
    const remaining = list.filter((_, i) => i !== index);
    if (remaining.length > 0) {
      this.listeners.set(event, remaining);
    } else {
      this.listeners.delete(event);
    }
    return this;
  }

  private emit<K extends keyof GitGuardianClientEvents>(
    event: K,
    payload: Parameters<GitGuardianClientEvents[K]>[0],
  ): void {
    const callbacks = this.listeners.get(event) ?? [];
    for (const cb of callbacks) {
      try {
        (cb as (p: typeof payload) => unknown)(payload);
      } catch {
        // Event observers must not disrupt request execution
      }
    }
  }

  /**
   * Returns a chainable {@link SecretIncidentResource} for managing a specific incident.
   *
   * @example
   * ```typescript
   * const incident = await gg.incident(123);
   * await gg.incident(123).resolve({ secret_revoked: true });
   * const notes = await gg.incident(123).notes();
   * ```
   */
  incident(id: number): SecretIncidentResource {
    return new SecretIncidentResource(
      this.requestFn,
      this.requestListFn,
      this.requestBodyFn,
      this.requestPatchFn,
      this.requestDeleteFn,
      id,
    );
  }

  /**
   * Returns a chainable {@link SourceResource} for inspecting a specific monitored repository or source.
   *
   * @example
   * ```typescript
   * const source = await gg.source(456);
   * const incidents = await gg.source(456).incidents();
   * ```
   */
  source(id: number): SourceResource {
    return new SourceResource(this.requestFn, this.requestListFn, this.requestPatchFn, id);
  }

  /**
   * Returns a chainable {@link HoneytokenResource} for inspecting or revoking a specific honeytoken.
   *
   * @example
   * ```typescript
   * const token = await gg.honeytoken('uuid-123');
   * await gg.honeytoken('uuid-123').revoke();
   * ```
   */
  honeytoken(id: string): HoneytokenResource {
    return new HoneytokenResource(
      this.requestFn,
      this.requestListFn,
      this.requestBodyFn,
      this.requestPatchFn,
      id,
    );
  }

  /**
   * Validates the configured API key and checks GitGuardian service availability.
   *
   * `GET /v1/health`
   */
  async health(signal?: AbortSignal): Promise<HealthStatus> {
    return this.request<HealthStatus>('/v1/health', undefined, signal);
  }

  /**
   * Retrieves scan quota usage and limits for the active API key.
   *
   * `GET /v1/quotas`
   */
  async quotas(signal?: AbortSignal): Promise<QuotaOverview> {
    return this.request<QuotaOverview>('/v1/quotas', undefined, signal);
  }

  /**
   * Retrieves GitGuardian egress IP addresses for firewall whitelisting.
   *
   * `GET /v1/ips`
   */
  async ips(signal?: AbortSignal): Promise<GitGuardianIps> {
    return this.request<GitGuardianIps>('/v1/ips', undefined, signal);
  }

  private async request<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    signal?: AbortSignal,
  ): Promise<T> {
    const url = buildUrl(`${this.security.getApiUrl()}${path}`, params);
    const startedAt = new Date();
    let statusCode: number | undefined;
    let error: Error | undefined;

    try {
      const fetcher = this.customFetch ?? fetch;
      const response = await fetcher(url, {
        method: 'GET',
        headers: this.security.getHeaders(),
        signal,
      });

      statusCode = response.status;
      if (!response.ok) {
        const body = await readResponseBody(response);
        throw new GitGuardianApiError(response.status, response.statusText, body);
      }

      return (await response.json()) as T;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      const finishedAt = new Date();
      this.emit('request', {
        url,
        method: 'GET',
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        statusCode,
        ...(error ? { error } : {}),
      });
    }
  }

  private async requestList<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    signal?: AbortSignal,
  ): Promise<GitGuardianPagedResponse<T>> {
    const url = buildUrl(`${this.security.getApiUrl()}${path}`, params);
    const startedAt = new Date();
    let statusCode: number | undefined;
    let error: Error | undefined;

    try {
      const fetcher = this.customFetch ?? fetch;
      const response = await fetcher(url, {
        method: 'GET',
        headers: this.security.getHeaders(),
        signal,
      });

      statusCode = response.status;
      if (!response.ok) {
        const body = await readResponseBody(response);
        throw new GitGuardianApiError(response.status, response.statusText, body);
      }

      const values = (await response.json()) as T[];
      const linkHeader = response.headers.get('link') ?? response.headers.get('Link');
      const { nextUrl, nextCursor } = parseNextLink(linkHeader);

      return {
        values,
        hasNextPage: Boolean(nextUrl || nextCursor),
        ...(nextCursor ? { nextCursor } : {}),
        ...(nextUrl ? { nextUrl } : {}),
      };
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      const finishedAt = new Date();
      this.emit('request', {
        url,
        method: 'GET',
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        statusCode,
        ...(error ? { error } : {}),
      });
    }
  }

  private async requestBody<T>(
    method: 'POST' | 'PATCH' | 'PUT',
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    const url = `${this.security.getApiUrl()}${path}`;
    const startedAt = new Date();
    let statusCode: number | undefined;
    let error: Error | undefined;

    try {
      const fetcher = this.customFetch ?? fetch;
      const response = await fetcher(url, {
        method,
        headers: this.security.getHeaders(),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
      });

      statusCode = response.status;
      if (!response.ok) {
        const errBody = await readResponseBody(response);
        throw new GitGuardianApiError(response.status, response.statusText, errBody);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      const finishedAt = new Date();
      this.emit('request', {
        url,
        method,
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        statusCode,
        ...(error ? { error } : {}),
      });
    }
  }

  private async requestDelete(path: string, signal?: AbortSignal): Promise<void> {
    const url = `${this.security.getApiUrl()}${path}`;
    const startedAt = new Date();
    let statusCode: number | undefined;
    let error: Error | undefined;

    try {
      const fetcher = this.customFetch ?? fetch;
      const response = await fetcher(url, {
        method: 'DELETE',
        headers: this.security.getHeaders(),
        signal,
      });

      statusCode = response.status;
      if (!response.ok) {
        const body = await readResponseBody(response);
        throw new GitGuardianApiError(response.status, response.statusText, body);
      }
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      const finishedAt = new Date();
      this.emit('request', {
        url,
        method: 'DELETE',
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        statusCode,
        ...(error ? { error } : {}),
      });
    }
  }
}
