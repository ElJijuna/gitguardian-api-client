import type { RequestBodyFn } from './types';
import type { ScanDocument, ScanResult, ScanCreateIncidentsPayload } from '../domain/Scan';

/**
 * Provides access to GitGuardian content scanning methods for secrets detection.
 *
 * @example
 * ```typescript
 * // Scan plain text
 * const result = await gg.scan.text("AWS_SECRET='AKIAIOSFODNN7EXAMPLE'");
 *
 * // Scan with filename context
 * const envResult = await gg.scan.file("DATABASE_URL=postgres://...", ".env");
 *
 * // Multiscan
 * const results = await gg.scan.multiple([
 *   { document: "...", filename: "config.json" },
 *   { document: "...", filename: "deploy.sh" }
 * ]);
 * ```
 */
export class ScanResource {
  /** @internal */
  constructor(private readonly post: RequestBodyFn) {}

  /**
   * Scans a single text document or string for secret leaks.
   *
   * `POST /v1/scan`
   *
   * @param document - Code or text content to scan
   * @param filename - Optional filename context to apply file-specific rules (e.g. '.env')
   * @param signal - Optional AbortSignal
   */
  async text(document: string, filename?: string, signal?: AbortSignal): Promise<ScanResult> {
    const payload: ScanDocument = { document };
    if (filename !== undefined) {
      payload.filename = filename;
    }
    return this.post<ScanResult>('/v1/scan', payload, signal);
  }

  /**
   * Scans a file with its filename context for secret leaks.
   *
   * Shorthand for `.text(document, filename)`.
   *
   * `POST /v1/scan`
   *
   * @param document - File content string
   * @param filename - File path or filename (e.g. 'src/secrets.py')
   * @param signal - Optional AbortSignal
   */
  async file(document: string, filename: string, signal?: AbortSignal): Promise<ScanResult> {
    return this.text(document, filename, signal);
  }

  /**
   * Scans multiple documents in a single request.
   *
   * `POST /v1/multiscan`
   *
   * @param documents - Array of documents to scan
   * @param signal - Optional AbortSignal
   */
  async multiple(documents: ScanDocument[], signal?: AbortSignal): Promise<ScanResult[]> {
    return this.post<ScanResult[]>('/v1/multiscan', documents, signal);
  }

  /**
   * Scans content and automatically registers any detected policy breaks as incidents in the GitGuardian dashboard.
   *
   * `POST /v1/scan/create-incidents`
   *
   * @param payload - Document content and optional source ID
   * @param signal - Optional AbortSignal
   */
  async createIncidents(
    payload: ScanCreateIncidentsPayload,
    signal?: AbortSignal,
  ): Promise<ScanResult> {
    return this.post<ScanResult>('/v1/scan/create-incidents', payload, signal);
  }
}
