/** Maximum characters to keep from plain-text error body in detail */
const MAX_DETAIL_LENGTH = 300;

/**
 * Thrown when the GitGuardian REST API returns a non-2xx HTTP response.
 *
 * @example
 * ```typescript
 * import { GitGuardianApiError } from 'gitguardian-api-client';
 *
 * try {
 *   await gg.incident(99999999);
 * } catch (err) {
 *   if (err instanceof GitGuardianApiError) {
 *     console.error(err.status);     // 404
 *     console.error(err.statusText); // 'Not Found'
 *     console.error(err.detail);     // 'Not found.'
 *     console.error(err.body);       // { detail: 'Not found.' }
 *   }
 * }
 * ```
 */
export class GitGuardianApiError extends Error {
  /** HTTP status code (e.g. 400, 401, 403, 404, 429, 500) */
  readonly status: number;
  /** HTTP status text (e.g. 'Bad Request', 'Unauthorized', 'Not Found') */
  readonly statusText: string;
  /** Parsed JSON body or raw text returned by the API */
  readonly body?: unknown;
  /** Human-readable explanation extracted from the response body */
  readonly detail?: string;

  constructor(status: number, statusText: string, body?: unknown) {
    const detail = extractDetail(body);
    const summary = [status, statusText].filter(Boolean).join(' ');
    const reason = detail && detail !== statusText ? ` — ${detail}` : '';
    super(`GitGuardian API error: ${summary}${reason}`);
    this.name = 'GitGuardianApiError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.detail = detail;
  }
}

/**
 * Extracts a concise error description from various GitGuardian API error formats.
 * Handles:
 * - `{ detail: '...' }`
 * - `{ message: '...' }`
 * - `{ error: '...' }`
 * - DRF validation dicts: `{ field: ['error 1', 'error 2'] }`
 * - Plain strings or arrays
 */
function extractDetail(body: unknown): string | undefined {
  if (typeof body === 'string') {
    const text = body.trim();
    if (!text || text.startsWith('<')) return undefined;
    return text.length > MAX_DETAIL_LENGTH ? `${text.slice(0, MAX_DETAIL_LENGTH)}…` : text;
  }

  if (typeof body !== 'object' || body === null) return undefined;

  if (Array.isArray(body)) {
    const items = body.map(extractDetail).filter(Boolean);
    return items.length > 0 ? items.join('; ') : undefined;
  }

  const record = body as Record<string, unknown>;

  for (const key of ['detail', 'message', 'error', 'title']) {
    const val = record[key];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }

  // Handle Django REST Framework field validation maps e.g. { "document": ["This field is required."] }
  const fieldErrors: string[] = [];
  for (const [key, val] of Object.entries(record)) {
    if (Array.isArray(val)) {
      const msgs = val.filter((m): m is string => typeof m === 'string');
      if (msgs.length > 0) {
        fieldErrors.push(`${key}: ${msgs.join(', ')}`);
      }
    } else if (typeof val === 'string') {
      fieldErrors.push(`${key}: ${val}`);
    }
  }

  if (fieldErrors.length > 0) {
    return fieldErrors.join('; ');
  }

  return undefined;
}
