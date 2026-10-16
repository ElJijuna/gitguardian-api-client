import { GitGuardianApiError } from '../src/errors/GitGuardianApiError';

describe('GitGuardianApiError', () => {
  it('extracts detail from { detail: "..." }', () => {
    const error = new GitGuardianApiError(401, 'Unauthorized', {
      detail: 'Invalid API key.',
    });
    expect(error.status).toBe(401);
    expect(error.statusText).toBe('Unauthorized');
    expect(error.detail).toBe('Invalid API key.');
    expect(error.message).toBe('GitGuardian API error: 401 Unauthorized — Invalid API key.');
    expect(error.name).toBe('GitGuardianApiError');
  });

  it('extracts detail from { message: "..." }', () => {
    const error = new GitGuardianApiError(403, 'Forbidden', {
      message: 'Access restricted to managers.',
    });
    expect(error.detail).toBe('Access restricted to managers.');
  });

  it('extracts field validation errors from DRF response', () => {
    const error = new GitGuardianApiError(400, 'Bad Request', {
      document: ['This field is required.'],
      filename: ['Ensure this value has at most 256 characters.'],
    });
    expect(error.detail).toContain('document: This field is required.');
    expect(error.detail).toContain('filename: Ensure this value has at most 256 characters.');
  });

  it('handles plain string body', () => {
    const error = new GitGuardianApiError(500, 'Internal Server Error', 'Service temporarily down');
    expect(error.detail).toBe('Service temporarily down');
  });

  it('ignores HTML response body from cloudflare or reverse proxy', () => {
    const error = new GitGuardianApiError(
      502,
      'Bad Gateway',
      '<html><body>502 Bad Gateway</body></html>',
    );
    expect(error.detail).toBeUndefined();
    expect(error.message).toBe('GitGuardian API error: 502 Bad Gateway');
  });

  it('handles array body', () => {
    const error = new GitGuardianApiError(400, 'Bad Request', ['First error', 'Second error']);
    expect(error.detail).toBe('First error; Second error');
  });

  it('works with undefined body', () => {
    const error = new GitGuardianApiError(404, 'Not Found');
    expect(error.status).toBe(404);
    expect(error.detail).toBeUndefined();
    expect(error.message).toBe('GitGuardian API error: 404 Not Found');
  });
});
