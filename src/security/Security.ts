/** Default GitGuardian US API base URL */
export const DEFAULT_GITGUARDIAN_API_URL = 'https://api.gitguardian.com';

/** GitGuardian Europe API base URL */
export const GITGUARDIAN_EU_API_URL = 'https://api.eu1.gitguardian.com';

/**
 * Handles API key authentication and headers for the GitGuardian REST API.
 *
 * @example
 * ```typescript
 * const security = new Security('my_api_key');
 * const headers = security.getHeaders();
 * // {
 * //   Authorization: 'Token my_api_key',
 * //   Accept: 'application/json',
 * //   'Content-Type': 'application/json',
 * //   'User-Agent': 'gitguardian-api-client/1.0.0'
 * // }
 * ```
 */
export class Security {
  private readonly apiUrl: string;
  private readonly apiKey?: string;

  /**
   * @param apiKey - Optional GitGuardian API key. If omitted, checks `process.env.GITGUARDIAN_API_KEY`.
   * @param apiUrl - Optional base API URL. Defaults to `'https://api.gitguardian.com'`.
   */
  constructor(apiKey?: string, apiUrl: string = DEFAULT_GITGUARDIAN_API_URL) {
    if (!URL.canParse(apiUrl)) {
      throw new TypeError(`Invalid apiUrl: "${apiUrl}" is not a valid URL`);
    }

    this.apiUrl = apiUrl.replace(/\/$/, '');
    this.apiKey =
      apiKey ?? (typeof process !== 'undefined' ? process.env?.GITGUARDIAN_API_KEY : undefined);
  }

  /**
   * Returns the base API URL without trailing slash.
   */
  getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Returns the configured API key, if present.
   */
  getApiKey(): string | undefined {
    return this.apiKey;
  }

  /**
   * Checks if an API key is configured.
   */
  hasApiKey(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Returns standard headers for GitGuardian API requests.
   */
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'gitguardian-api-client/1.0.0',
    };

    if (this.apiKey) {
      headers.Authorization = `Token ${this.apiKey}`;
    }

    return headers;
  }
}
