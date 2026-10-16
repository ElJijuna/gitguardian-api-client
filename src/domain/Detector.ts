import type { PaginationParams } from './Pagination';

/**
 * Secret detector definition available in the GitGuardian engine.
 */
export interface SecretDetector {
  /** Unique technical identifier */
  name: string;
  /** Human-readable display title */
  display_name: string;
  /** Detector nature/category */
  nature?: string;
  /** Detector family classification */
  family?: string;
  /** Explanation of what this detector looks for */
  description?: string;
  /** Whether GitGuardian can automatically check the validity of secrets detected by this detector */
  checker_supported?: boolean;
  [key: string]: unknown;
}

/**
 * Query parameters for listing secret detectors (`GET /v1/secret_detectors`).
 */
export interface ListDetectorsParams extends PaginationParams {
  search?: string;
}
