import type { GitGuardianPagedResponse } from '../domain/Pagination';

/**
 * Signature for GET requests returning a single object.
 */
export type RequestFn = <T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  signal?: AbortSignal,
) => Promise<T>;

/**
 * Signature for GET requests returning a paginated list with cursor links.
 */
export type RequestListFn = <T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  signal?: AbortSignal,
) => Promise<GitGuardianPagedResponse<T>>;

/**
 * Signature for POST requests.
 */
export type RequestBodyFn = <T>(path: string, body?: unknown, signal?: AbortSignal) => Promise<T>;

/**
 * Signature for PATCH requests.
 */
export type RequestPatchFn = <T>(path: string, body?: unknown, signal?: AbortSignal) => Promise<T>;

/**
 * Signature for PUT requests.
 */
export type RequestPutFn = <T>(path: string, body?: unknown, signal?: AbortSignal) => Promise<T>;

/**
 * Signature for DELETE requests.
 */
export type RequestDeleteFn = (path: string, signal?: AbortSignal) => Promise<void>;
