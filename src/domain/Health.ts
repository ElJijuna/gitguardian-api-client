/**
 * Response returned by `GET /v1/health`.
 */
export interface HealthStatus {
  /** Health detail, typically "Valid API key." if authentication succeeds */
  detail: string;
}

/**
 * Quota information returned by `GET /v1/quotas`.
 */
export interface QuotaOverview {
  content: {
    /** Number of scans / requests used in the current period */
    count: number;
    /** Maximum allowed scans in the current period */
    limit: number;
    /** Remaining quota in the current period */
    remaining: number;
    /** ISO date string indicating when the quota period started (e.g. "2024-01-01") */
    since: string;
  };
}

/**
 * GitGuardian egress IPs returned by `GET /v1/ips`.
 */
export interface GitGuardianIps {
  /** Array of IP address strings */
  ips?: string[];
  [key: string]: unknown;
}
