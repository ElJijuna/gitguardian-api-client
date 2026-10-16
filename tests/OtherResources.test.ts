import { GitGuardianClient } from '../src/GitGuardianClient';

describe('Members, Teams, AuditLogs, Detectors, Tokens, and Occurrences', () => {
  it('manages members', async () => {
    const member = { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'manager' };
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [member],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => member,
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const list = await gg.members.list();
    expect(list.values).toHaveLength(1);

    const single = await gg.members.get(1);
    expect(single.name).toBe('Alice Smith');
  });

  it('manages teams', async () => {
    const team = { id: 10, name: 'Security Operations', is_global: true };
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [team],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => team,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => team,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ...team, description: 'Updated' }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [{ id: 1, full_name: 'org/repo' }],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [{ id: 101, status: 'TRIGGERED' }],
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });

    const teams = await gg.teams.list();
    expect(teams.values).toHaveLength(1);

    const created = await gg.teams.create({ name: 'Security Operations', is_global: true });
    expect(created.id).toBe(10);

    const fetched = await gg.teams.get(10);
    expect(fetched.name).toBe('Security Operations');

    const updated = await gg.teams.update(10, { description: 'Updated' });
    expect(updated.description).toBe('Updated');

    await gg.teams.delete(10);

    const sources = await gg.teams.sources(10);
    expect(sources.values).toHaveLength(1);

    const incidents = await gg.teams.incidents(10);
    expect(incidents.values).toHaveLength(1);
  });

  it('manages audit logs', async () => {
    const auditLog = { id: 7, action_type: 'member_invited', date: '2024-03-01T12:00:00Z' };
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [auditLog],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ['incident_resolved', 'member_invited'],
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });

    const logs = await gg.auditLogs.list();
    expect(logs.values).toHaveLength(1);

    const names = await gg.auditLogs.eventNames();
    expect(names).toEqual(['incident_resolved', 'member_invited']);
  });

  it('queries detectors', async () => {
    const detector = {
      name: 'slack_bot_token',
      display_name: 'Slack Bot Token',
      family: 'Token',
    };
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [detector],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => detector,
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });

    const list = await gg.secretDetectors.list();
    expect(list.values).toHaveLength(1);

    const single = await gg.secretDetectors.get('slack_bot_token');
    expect(single.name).toBe('slack_bot_token');
  });

  it('manages API tokens', async () => {
    const token = {
      id: 'token-uuid',
      name: 'CI Pipeline Token',
      created_at: '2024-03-01T12:00:00Z',
    };

    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => token,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [token],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => token,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => token,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });

    const selfToken = await gg.apiTokens.self();
    expect(selfToken.id).toBe('token-uuid');

    const list = await gg.apiTokens.list();
    expect(list.values).toHaveLength(1);

    const created = await gg.apiTokens.create({ name: 'CI Pipeline Token' });
    expect(created.id).toBe('token-uuid');

    const fetched = await gg.apiTokens.get('token-uuid');
    expect(fetched.name).toBe('CI Pipeline Token');

    await gg.apiTokens.delete('token-uuid');
  });

  it('queries occurrences', async () => {
    const occ = {
      id: 99,
      incident_id: 101,
      filepath: 'config.py',
      presence: 'present',
    };

    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [occ],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => occ,
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });

    const list = await gg.occurrences.list({ incident_id: 101 });
    expect(list.values).toHaveLength(1);

    const single = await gg.occurrences.get(99);
    expect(single.filepath).toBe('config.py');
  });
});
