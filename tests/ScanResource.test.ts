import { GitGuardianClient } from '../src/GitGuardianClient';
import type { ScanResult } from '../src/domain/Scan';

describe('ScanResource', () => {
  const sampleScanResult: ScanResult = {
    policy_break_count: 1,
    policies: ['Secrets detection'],
    is_diff: false,
    policy_breaks: [
      {
        type: 'GitGuardian Token',
        policy: 'Secrets detection',
        validity: 'valid',
        known_secret: false,
        matches: [
          {
            type: 'apikey',
            match: 'ggp_1234567890abcdef',
            line_start: 1,
            line_end: 1,
            index_start: 11,
            index_end: 32,
          },
        ],
      },
    ],
  };

  it('scans text document without filename', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => sampleScanResult,
    } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const result = await gg.scan.text('const key = "ggp_1234567890abcdef";');

    expect(result).toEqual(sampleScanResult);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.gitguardian.com/v1/scan',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ document: 'const key = "ggp_1234567890abcdef";' }),
      }),
    );
  });

  it('scans file with filename context', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => sampleScanResult,
    } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const result = await gg.scan.file('AWS_SECRET=xyz', '.env');

    expect(result).toEqual(sampleScanResult);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.gitguardian.com/v1/scan',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ document: 'AWS_SECRET=xyz', filename: '.env' }),
      }),
    );
  });

  it('performs multiscan on an array of documents', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => [sampleScanResult, sampleScanResult],
    } as unknown as Response);

    const docs = [
      { document: 'file 1 content', filename: 'file1.js' },
      { document: 'file 2 content', filename: 'file2.js' },
    ];

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const results = await gg.scan.multiple(docs);

    expect(results).toHaveLength(2);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.gitguardian.com/v1/multiscan',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(docs),
      }),
    );
  });

  it('scans and creates incidents in dashboard', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => sampleScanResult,
    } as unknown as Response);

    const gg = new GitGuardianClient({ fetch: mockFetch as unknown as typeof fetch });
    const payload = {
      document: 'TOKEN = 12345',
      filename: 'creds.json',
      source_id: 42,
    };
    const result = await gg.scan.createIncidents(payload);

    expect(result).toEqual(sampleScanResult);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.gitguardian.com/v1/scan/create-incidents',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    );
  });
});
