import { GitGuardianClient } from '../src/GitGuardianClient';
import type { Honeytoken } from '../src/domain/Honeytoken';

describe('HoneytokensResource & HoneytokenResource', () => {
  const sampleHoneytoken: Honeytoken = {
    id: 'uuid-123',
    name: 'AWS Canary Key',
    description: 'Placed in staging environment',
    type: 'AWS',
    status: 'active',
    created_at: '2024-03-01T12:00:00Z',
    token: {
      aws_access_key_id: 'AKIA...',
      aws_secret_access_key: 'secret...',
    },
  };

  it('lists honeytokens with pagination', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => [sampleHoneytoken],
    } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const paged = await gg.honeytokens.list({ status: 'active' });

    expect(paged.values).toHaveLength(1);
    expect(paged.values[0].name).toBe('AWS Canary Key');
  });

  it('creates a new honeytoken', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => sampleHoneytoken,
    } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const created = await gg.honeytokens.create({
      name: 'AWS Canary Key',
      type: 'AWS',
      description: 'Placed in staging environment',
    });

    expect(created.id).toBe('uuid-123');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.gitguardian.com/v1/honeytokens',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('allows direct await on honeytoken resource', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => sampleHoneytoken,
    } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const token = await gg.honeytoken('uuid-123');

    expect(token.id).toBe('uuid-123');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.gitguardian.com/v1/honeytokens/uuid-123',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('resets and revokes a honeytoken', async () => {
    const revokedToken = { ...sampleHoneytoken, status: 'revoked' as const };
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => sampleHoneytoken,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => revokedToken,
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });

    await gg.honeytoken('uuid-123').reset();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.gitguardian.com/v1/honeytokens/uuid-123/reset',
      expect.objectContaining({ method: 'POST' }),
    );

    const revoked = await gg.honeytoken('uuid-123').revoke();
    expect(revoked.status).toBe('revoked');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.gitguardian.com/v1/honeytokens/uuid-123/revoke',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('queries honeytoken events and notes', async () => {
    const mockEvent = {
      id: 'evt-1',
      honeytoken_id: 'uuid-123',
      created_at: '2024-03-01T15:00:00Z',
    };
    const mockNote = {
      id: 2,
      incident_id: 0,
      comment: 'Decoy placed in Dockerfile',
      created_at: '2024-03-01T12:00:00Z',
      updated_at: '2024-03-01T12:00:00Z',
    };

    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [mockEvent],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => [mockNote],
      } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });

    const events = await gg.honeytoken('uuid-123').events();
    expect(events.values).toHaveLength(1);
    expect(events.values[0].id).toBe('evt-1');

    const notes = await gg.honeytoken('uuid-123').notes();
    expect(notes).toHaveLength(1);
    expect(notes[0].comment).toBe('Decoy placed in Dockerfile');
  });
});
