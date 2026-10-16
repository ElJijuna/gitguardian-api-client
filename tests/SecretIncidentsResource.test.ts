import { GitGuardianClient } from '../src/GitGuardianClient';
import type { SecretIncident } from '../src/domain/Incident';

describe('SecretIncidentsResource & SecretIncidentResource', () => {
  const sampleIncident: SecretIncident = {
    id: 101,
    date: '2024-03-01T12:00:00Z',
    detector: {
      name: 'slack_bot_token',
      display_name: 'Slack Bot Token',
    },
    secret_hash: 'abc123hash',
    status: 'TRIGGERED',
    severity: 'critical',
    validity: 'valid',
    tags: ['DEFAULT_BRANCH'],
    occurrences_count: 1,
  };

  it('lists secret incidents with cursor pagination', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json',
        link: '<https://api.gitguardian.com/v1/incidents/secrets?cursor=cur_next>; rel="next"',
      }),
      json: async () => [sampleIncident],
    } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const paged = await gg.incidents.list({ status: 'TRIGGERED', severity: 'critical' });

    expect(paged.values).toHaveLength(1);
    expect(paged.values[0].id).toBe(101);
    expect(paged.hasNextPage).toBe(true);
    expect(paged.nextCursor).toBe('cur_next');
    expect(paged.nextUrl).toBe('https://api.gitguardian.com/v1/incidents/secrets?cursor=cur_next');
  });

  it('allows awaiting incident directly via PromiseLike', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => sampleIncident,
    } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const incident = await gg.incident(101);

    expect(incident.id).toBe(101);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.gitguardian.com/v1/incidents/secrets/101',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('resolves an incident', async () => {
    const resolvedIncident = { ...sampleIncident, status: 'RESOLVED', secret_revoked: true };
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => resolvedIncident,
    } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const result = await gg.incident(101).resolve({ secret_revoked: true });

    expect(result.status).toBe('RESOLVED');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.gitguardian.com/v1/incidents/secrets/101/resolve',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ secret_revoked: true }),
      }),
    );
  });

  it('ignores and reopens an incident', async () => {
    const ignoredIncident = {
      ...sampleIncident,
      status: 'IGNORED',
      ignore_reason: 'false_positive',
    };
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ignoredIncident,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => sampleIncident,
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const resIgnore = await gg.incident(101).ignore({ ignore_reason: 'false_positive' });
    expect(resIgnore.status).toBe('IGNORED');

    const resReopen = await gg.incident(101).reopen();
    expect(resReopen.status).toBe('TRIGGERED');
  });

  it('assigns and unassigns an incident', async () => {
    const assignedIncident = {
      ...sampleIncident,
      status: 'ASSIGNED',
      assignee_email: 'sec@test.org',
    };
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => assignedIncident,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => sampleIncident,
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const resAssign = await gg.incident(101).assign({ email: 'sec@test.org' });
    expect(resAssign.assignee_email).toBe('sec@test.org');

    const resUnassign = await gg.incident(101).unassign();
    expect(resUnassign.id).toBe(101);
  });

  it('shares and unshares an incident', async () => {
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ share_url: 'https://dashboard.gitguardian.com/share/xyz' }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const shareRes = await gg.incident(101).share({ auto_healing: true });
    expect(shareRes.share_url).toBe('https://dashboard.gitguardian.com/share/xyz');

    await gg.incident(101).unshare();
    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://api.gitguardian.com/v1/incidents/secrets/101/unshare',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('performs CRUD operations on incident notes', async () => {
    const sampleNote = {
      id: 5,
      incident_id: 101,
      comment: 'Initial note',
      created_at: '2024-03-01T12:00:00Z',
      updated_at: '2024-03-01T12:00:00Z',
    };

    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [sampleNote],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => sampleNote,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ...sampleNote, comment: 'Updated note' }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });

    const notes = await gg.incident(101).notes();
    expect(notes).toHaveLength(1);

    const added = await gg.incident(101).addNote('Initial note');
    expect(added.comment).toBe('Initial note');

    const updated = await gg.incident(101).updateNote(5, 'Updated note');
    expect(updated.comment).toBe('Updated note');

    await gg.incident(101).deleteNote(5);
    expect(mockFetch).toHaveBeenLastCalledWith(
      'https://api.gitguardian.com/v1/incidents/secrets/101/notes/5',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('fetches incident activity logs and locations', async () => {
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [{ id: 1, action_type: 'resolve', date: '2024-03-01' }],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [{ id: 2, filepath: 'src/config.py', sha: 'commitsha1' }],
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });

    const logs = await gg.incident(101).activityLogs();
    expect(logs.values).toHaveLength(1);

    const locs = await gg.incident(101).locations();
    expect(locs.values).toHaveLength(1);
    expect(locs.values[0].filepath).toBe('src/config.py');
  });
});
