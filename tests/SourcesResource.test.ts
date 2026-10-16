import { GitGuardianClient } from '../src/GitGuardianClient';
import type { Source } from '../src/domain/Source';

describe('SourcesResource & SourceResource', () => {
  const sampleSource: Source = {
    id: 50,
    url: 'https://github.com/org/repo',
    type: 'github',
    full_name: 'org/repo',
    monitored: true,
    open_incidents_count: 2,
    closed_incidents_count: 5,
  };

  it('lists monitored sources', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => [sampleSource],
    } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const paged = await gg.sources.list({ monitored: true });

    expect(paged.values).toHaveLength(1);
    expect(paged.values[0].full_name).toBe('org/repo');
  });

  it('allows awaiting source directly via PromiseLike', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => sampleSource,
    } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const source = await gg.source(50);

    expect(source.id).toBe(50);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.gitguardian.com/v1/sources/50',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('updates source monitoring setting', async () => {
    const updatedSource = { ...sampleSource, monitored: false };
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => updatedSource,
    } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const res = await gg.source(50).update({ monitored: false });

    expect(res.monitored).toBe(false);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.gitguardian.com/v1/sources/50',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ monitored: false }),
      }),
    );
  });

  it('retrieves source incidents and locations', async () => {
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [{ id: 101, status: 'TRIGGERED' }],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [{ id: 201, filepath: 'main.py' }],
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });

    const incidents = await gg.source(50).incidents();
    expect(incidents.values).toHaveLength(1);

    const locations = await gg.source(50).locations();
    expect(locations.values).toHaveLength(1);
    expect(locations.values[0].filepath).toBe('main.py');
  });
});
