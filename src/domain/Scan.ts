/**
 * Single document to scan for secret leaks.
 */
export interface ScanDocument {
  /** The text content or code to scan */
  document: string;
  /** Optional filename to provide context and file extension rules (e.g. '.env', 'config.json') */
  filename?: string;
}

/**
 * Secret match position and details within a scanned document.
 */
export interface PolicyMatch {
  /** Match type (e.g. 'apikey', 'username', 'password', 'host', 'filename') */
  type: string;
  /** Matched sensitive text snippet */
  match: string;
  /** Line number where match starts (1-based index) */
  line_start?: number;
  /** Line number where match ends (1-based index) */
  line_end?: number;
  /** Character index where match starts (0-based) */
  index_start?: number;
  /** Character index where match ends (0-based) */
  index_end?: number;
}

/**
 * Policy break found in a scanned document.
 */
export interface PolicyBreak {
  /** Type of detected secret or policy violation */
  type: string;
  /** Policy name (e.g. 'Secrets detection', 'Filenames') */
  policy: string;
  /** Validity status of detected credential */
  validity?:
    | 'valid'
    | 'invalid'
    | 'failed_to_check'
    | 'no_checker'
    | 'cannot_check'
    | 'unknown'
    | null;
  /** Sensitive matches found */
  matches: PolicyMatch[];
  /** True if this secret was already known in your GitGuardian dashboard */
  known_secret?: boolean;
  /** Direct URL to incident in GitGuardian dashboard if known */
  incident_url?: string;
}

/**
 * Result of scanning a single document.
 */
export interface ScanResult {
  /** Total count of policy breaks detected */
  policy_break_count: number;
  /** List of policies evaluated (e.g. ['Filename', 'Secrets detection']) */
  policies: string[];
  /** Detailed policy breaks and secret occurrences */
  policy_breaks: PolicyBreak[];
  /** True if the scanned document was analyzed as a git diff patch */
  is_diff: boolean;
}

/**
 * Document payload for `/v1/scan/create-incidents`.
 */
export interface ScanCreateIncidentsPayload extends ScanDocument {
  /** Optional monitored source ID to associate created incidents with */
  source_id?: number;
}
