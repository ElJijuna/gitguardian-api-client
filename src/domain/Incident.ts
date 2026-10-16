import type { PaginationParams } from './Pagination';

/**
 * Status lifecycle of a secret incident in GitGuardian.
 */
export type IncidentStatus = 'TRIGGERED' | 'ASSIGNED' | 'RESOLVED' | 'IGNORED';

/**
 * Severity level assigned to an incident.
 */
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'unknown';

/**
 * Secret verification status.
 */
export type IncidentValidity = 'valid' | 'invalid' | 'failed_to_check' | 'no_checker' | 'unknown';

/**
 * Common tags attached to incidents.
 */
export type IncidentTag =
  | 'DEFAULT_BRANCH'
  | 'FROM_HISTORICAL_SCAN'
  | 'CHECK_RUN_SKIP_FALSE_POSITIVE'
  | 'CHECK_RUN_SKIP_LOW_RISK'
  | 'CHECK_RUN_SKIP_TEST_CRED'
  | 'IGNORED_IN_CHECK_RUN'
  | 'PUBLIC'
  | 'PUBLICLY_EXPOSED'
  | 'PUBLICLY_LEAKED'
  | 'REGRESSION'
  | 'SENSITIVE_FILE'
  | 'TEST_FILE'
  | 'FALSE_POSITIVE'
  | 'VAULTED'
  | 'REVOCABLE_BY_GG'
  | string;

/**
 * Detector information that identified the secret.
 */
export interface IncidentDetector {
  /** Detector technical identifier (e.g. 'github_token') */
  name: string;
  /** Human-friendly name (e.g. 'GitHub Personal Access Token') */
  display_name?: string;
  /** Nature of detector */
  nature?: string;
  /** Detector family (e.g. 'Token', 'Key') */
  family?: string;
}

/**
 * Secret incident entity.
 */
export interface SecretIncident {
  /** Unique numeric ID of the incident */
  id: number;
  /** ISO timestamp when the secret was first detected */
  date: string;
  /** Information on the detector that flagged the incident */
  detector: IncidentDetector;
  /** SHA-256 hash representing the secret value */
  secret_hash: string;
  /** Current status of the incident */
  status: IncidentStatus;
  /** Severity rating */
  severity: IncidentSeverity;
  /** Validity of the secret */
  validity: IncidentValidity;
  /** Number of occurrences of this secret across monitored sources */
  occurrences_count?: number;
  /** Whether the secret represents a regression after being fixed */
  regression?: boolean;
  /** Tags associated with this incident */
  tags: IncidentTag[];
  /** Email of assigned user, if any */
  assignee_email?: string | null;
  /** ID of assigned member, if any */
  assignee_id?: number | null;
  /** Timestamp when incident was resolved, if resolved */
  resolved_at?: string | null;
  /** Whether the underlying secret has been revoked */
  secret_revoked?: boolean;
  /** Timestamp when incident was ignored, if ignored */
  ignored_at?: string | null;
  /** Reason why the incident was ignored */
  ignore_reason?: string | null;
  /** Temporary public sharing URL, if generated */
  share_url?: string | null;
  /** Calculated risk score (0-100) */
  risk_score?: number | null;
  [key: string]: unknown;
}

/**
 * Remediation note attached to an incident.
 */
export interface IncidentNote {
  /** Unique ID of the note */
  id: number;
  /** Incident ID */
  incident_id: number;
  /** ID of author member */
  user_id?: number;
  /** Display name of the author */
  user_name?: string;
  /** Comment text content */
  comment: string;
  /** ISO timestamp when note was created */
  created_at: string;
  /** ISO timestamp when note was last updated */
  updated_at: string;
}

/**
 * Audit log entry tracking actions taken on an incident.
 */
export interface IncidentActivityLog {
  id: number;
  action_type: string;
  date: string;
  author_name?: string;
  author_email?: string;
  details?: Record<string, unknown>;
}

/**
 * Location where a secret occurrence was detected.
 */
export interface IncidentLocation {
  id: number;
  type?: string;
  url?: string;
  sha?: string;
  filepath?: string;
  change_type?: 'addition' | 'deletion' | 'context' | string;
  [key: string]: unknown;
}

/**
 * Filter query parameters for `GET /v1/incidents/secrets`.
 */
export interface ListIncidentsParams extends PaginationParams {
  /** Filter by status */
  status?: IncidentStatus;
  /** Filter by severity */
  severity?: IncidentSeverity;
  /** Filter by validity */
  validity?: IncidentValidity;
  /** Incidents assigned to this email address */
  assignee_email?: string;
  /** Incidents assigned to this member ID */
  assignee_id?: number;
  /** Incidents detected after this date (ISO string) */
  date_after?: string;
  /** Incidents detected before this date (ISO string) */
  date_before?: string;
  /** Comma-separated list of tags to filter by */
  tags?: string;
  /** Comma-separated list of tags to exclude */
  exclude_tags?: string;
  /** Ordering e.g. 'date', '-date', 'risk_score', '-risk_score' */
  ordering?: string;
  /** Filter by detector group technical name */
  detector_group_name?: string;
  /** Minimum risk score (0-100) */
  risk_score_min?: number;
  /** Maximum risk score (0-100) */
  risk_score_max?: number;
}

/**
 * Request payload for resolving an incident.
 */
export interface ResolveIncidentData {
  /** Set to true if the secret was successfully revoked */
  secret_revoked?: boolean;
}

/**
 * Request payload for ignoring an incident.
 */
export interface IgnoreIncidentData {
  /** Reason for ignoring the incident */
  ignore_reason?:
    | 'false_positive'
    | 'test_credential'
    | 'low_risk'
    | 'cant_revoke'
    | 'wont_fix'
    | string;
}

/**
 * Request payload for assigning an incident.
 */
export interface AssignIncidentData {
  /** Email of the member to assign */
  email?: string;
  /** Member ID to assign */
  member_id?: number;
}

/**
 * Request payload for sharing an incident.
 */
export interface ShareIncidentData {
  /** Whether auto-healing options should be exposed on the shared page */
  auto_healing?: boolean;
}

/**
 * Request payload for adding or updating an incident note.
 */
export interface NoteData {
  /** Markdown or text comment */
  comment: string;
}
