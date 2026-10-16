/**
 * Common pagination parameters accepted by GitGuardian REST API list endpoints.
 *
 * GitGuardian uses cursor-based pagination. Pass `cursor` and `per_page` to control results.
 */
export interface PaginationParams {
  /**
   * Maximum number of results per page.
   * GitGuardian default is `20`, maximum is `100`.
   */
  per_page?: number;
  /**
   * Cursor pointing to the next or previous page.
   * Use `nextCursor` from a previous {@link GitGuardianPagedResponse}.
   */
  cursor?: string;
}

/**
 * Wrapper returned by GitGuardian paginated list endpoints.
 *
 * Use `values` for the items, and check `hasNextPage` and `nextCursor` to paginate forward.
 *
 * @example
 * ```typescript
 * let cursor: string | undefined;
 * let hasMore = true;
 * while (hasMore) {
 *   const res = await gg.incidents.list({ per_page: 50, cursor });
 *   for (const incident of res.values) {
 *     console.log(incident.id, incident.detector.name);
 *   }
 *   hasMore = res.hasNextPage;
 *   cursor = res.nextCursor;
 * }
 * ```
 */
export interface GitGuardianPagedResponse<T> {
  /** The items on the current page */
  values: T[];
  /** Whether there are more pages available */
  hasNextPage: boolean;
  /** The cursor string for fetching the next page, if available */
  nextCursor?: string;
  /** The full URL of the next page parsed from the `Link` header, if available */
  nextUrl?: string;
}
