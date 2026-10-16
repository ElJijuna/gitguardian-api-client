import {
  GitGuardianClient,
  buildUrl,
  parseNextLink,
  type RequestEvent,
} from '../src/GitGuardianClient';
import { GitGuardianApiError } from '../src/errors/GitGuardianApiError';
import { GITGUARDIAN_EU_API_URL } from '../src/security/Security';

describe('GitGuardianClient', () => {
  describe('buildUrl', () => {
    it('returns base URL unchanged when params are empty or undefined', () => {
      expect(buildUrl('https://api.gitguardian.com/v1/health')).toBe(
        'https://api.gitguardian.com/v1/health',
      );
      expect(buildUrl('https://api.gitguardian.com/v1/health', {})).toBe(
        'https://api.gitguardian.com/v1/health',
      );
    });

    it('serializes query parameters correctly and omits undefined/null values', () => {
      const url = buildUrl('https://api.gitguardian.com/v1/incidents/secrets', {
        status: 'TRIGGERED',
        per_page: 20,
        empty: undefined,
        cursor: 'abc123==',
      });
      expect(url).toContain('status=TRIGGERED');
      expect(url).toContain('per_page=20');
      expect(url).toContain('cursor=abc123%3D%3D');
      expect(url).not.toContain('empty=');
    });

    it('appends with & if URL already has query string', () => {
      const url = buildUrl('https://api.gitguardian.com/v1/incidents/secrets?filter=1', {
        per_page: 10,
      });
      expect(url).toBe('https://api.gitguardian.com/v1/incidents/secrets?filter=1&per_page=10');
    });
  });

  describe('parseNextLink', () => {
    it('returns empty object when linkHeader is missing or invalid', () => {
      expect(parseNextLink(undefined)).toEqual({});
      expect(parseNextLink(null)).toEqual({});
      expect(parseNextLink('')).toEqual({});
      expect(parseNextLink('<http://api.gitguardian.com>; rel="prev"')).toEqual({});
    });

    it('extracts nextUrl and nextCursor from GitGuardian link header', () => {
      const header =
        '<https://api.gitguardian.com/v1/incidents/secrets?cursor=cD0xNTA%3D>; rel="next", <https://api.gitguardian.com/v1/incidents/secrets?cursor=cD01MA%3D>; rel="prev"';
      const result = parseNextLink(header);
      expect(result.nextUrl).toBe(
        'https://api.gitguardian.com/v1/incidents/secrets?cursor=cD0xNTA%3D',
      );
      expect(result.nextCursor).toBe('cD0xNTA=');
    });
  });

  describe('Client requests & events', () => {
    it('performs health check request and invokes event listeners', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Valid API key.' }),
      } as unknown as Response);

      const events: RequestEvent[] = [];
      const gg = new GitGuardianClient({
        apiKey: 'test_token',
        fetch: mockFetch as unknown as typeof fetch,
      });

      gg.on('request', (e) => events.push(e));

      const res = await gg.health();
      expect(res).toEqual({ detail: 'Valid API key.' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.gitguardian.com/v1/health',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Token test_token',
          }),
        }),
      );

      expect(events).toHaveLength(1);
      expect(events[0].url).toBe('https://api.gitguardian.com/v1/health');
      expect(events[0].method).toBe('GET');
      expect(events[0].statusCode).toBe(200);
      expect(events[0].durationMs).toBeGreaterThanOrEqual(0);
    });

    it('allows unsubscribing from event listeners with off()', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Valid API key.' }),
      } as unknown as Response);

      const events: RequestEvent[] = [];
      const listener = (e: RequestEvent) => events.push(e);

      const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
      gg.on('request', listener);
      await gg.health();
      expect(events).toHaveLength(1);

      gg.off('request', listener);
      await gg.health();
      expect(events).toHaveLength(1);
    });

    it('throws GitGuardianApiError on non-ok status and includes error in request event', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Invalid API key.' }),
      } as unknown as Response);

      const events: RequestEvent[] = [];
      const gg = new GitGuardianClient({
        apiKey: 'bad_token',
        fetch: mockFetch as unknown as typeof fetch,
      });
      gg.on('request', (e) => events.push(e));

      await expect(gg.health()).rejects.toThrow(GitGuardianApiError);

      expect(events).toHaveLength(1);
      expect(events[0].statusCode).toBe(401);
      expect(events[0].error).toBeInstanceOf(GitGuardianApiError);
    });

    it('retrieves quotas successfully', async () => {
      const quotaData = {
        content: { count: 12, limit: 1000, remaining: 988, since: '2024-01-01' },
      };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => quotaData,
      } as unknown as Response);

      const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
      const res = await gg.quotas();
      expect(res).toEqual(quotaData);
    });

    it('retrieves egress IPs successfully', async () => {
      const ipsData = { ips: ['1.2.3.4', '5.6.7.8'] };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ipsData,
      } as unknown as Response);

      const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
      const res = await gg.ips();
      expect(res).toEqual(ipsData);
    });

    it('supports European region apiUrl option', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Valid API key.' }),
      } as unknown as Response);

      const gg = new GitGuardianClient({
        apiUrl: GITGUARDIAN_EU_API_URL,
        fetch: mockFetch as unknown as typeof fetch,
      });

      await gg.health();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.eu1.gitguardian.com/v1/health',
        expect.anything(),
      );
    });
  });
});
