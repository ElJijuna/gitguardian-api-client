import type { PaginationParams } from './Pagination';

/**
 * Honeytoken status.
 */
export type HoneytokenStatus = 'active' | 'revoked';

/**
 * Honeytoken entity representing an active decoy credential.
 */
export interface Honeytoken {
  /** UUID of the honeytoken */
  id: string;
  /** Human-readable name */
  name: string;
  /** Purpose description or placement notes */
  description?: string | null;
  /** Honeytoken type (e.g. 'AWS') */
  type: string;
  /** Current state */
  status: HoneytokenStatus;
  /** ID of the creator member */
  creator_id?: number;
  /** ISO timestamp when created */
  created_at: string;
  /** ISO timestamp when revoked, if revoked */
  revoked_at?: string | null;
  /** Decoy credential payload (e.g. AWS access key / secret key) returned on creation */
  token?: Record<string, string>;
  /** Number of alerts / access events triggered by this token */
  open_events_count?: number;
  /** Tags or labels attached to the honeytoken */
  labels?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Request payload for creating a new honeytoken (`POST /v1/honeytokens`).
 */
export interface CreateHoneytokenData {
  /** Name of the honeytoken */
  name: string;
  /** Type of decoy credential (e.g. 'AWS') */
  type: string;
  /** Contextual description */
  description?: string;
  /** Key-value labels for tracking */
  labels?: Record<string, string>;
}

/**
 * Request payload for updating a honeytoken (`PATCH /v1/honeytokens/{id}`).
 */
export interface UpdateHoneytokenData {
  name?: string;
  description?: string;
}

/**
 * Honeytoken event triggered when someone attempts to use the decoy credential.
 */
export interface HoneytokenEvent {
  id: string;
  honeytoken_id: string;
  created_at: string;
  action_taken?: string;
  source_ip?: string;
  caller?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Query parameters for listing honeytokens (`GET /v1/honeytokens`).
 */
export interface ListHoneytokensParams extends PaginationParams {
  /** Filter by active or revoked */
  status?: HoneytokenStatus;
  /** Filter by honeytoken type */
  type?: string;
  /** Search by name */
  search?: string;
}
