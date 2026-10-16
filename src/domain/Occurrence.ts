import type { PaginationParams } from './Pagination';

/**
 * An occurrence is a specific location where a secret incident was discovered.
 */
export interface SecretOccurrence {
  /** Occurrence ID */
  id: number;
  /** Associated incident ID */
  incident_id: number;
  /** Kind of occurrence (e.g. 'commit', 'issue', 'comment') */
  kind?: string;
  /** Git commit SHA, if found in git */
  sha?: string | null;
  /** Relative path of the file where the secret was detected */
  filepath?: string | null;
  /** Commit author or contributor */
  author?: string | null;
  /** ISO date when the occurrence was committed or recorded */
  date?: string | null;
  /** Direct link to the occurrence on VCS provider */
  url?: string | null;
  /** Whether the secret is still present in the latest revision */
  presence?: 'present' | 'removed' | string;
  [key: string]: unknown;
}

/**
 * Query parameters for listing secret occurrences (`GET /v1/occurrences/secrets`).
 */
export interface ListOccurrencesParams extends PaginationParams {
  /** Filter occurrences by incident ID */
  incident_id?: number;
  /** Filter by presence ('present' or 'removed') */
  presence?: 'present' | 'removed' | string;
  /** Occurrences found after this date (ISO string) */
  date_after?: string;
  /** Occurrences found before this date (ISO string) */
  date_before?: string;
}
