import {
  Security,
  DEFAULT_GITGUARDIAN_API_URL,
  GITGUARDIAN_EU_API_URL,
} from '../src/security/Security';

describe('Security', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GITGUARDIAN_API_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('initializes with default US API URL when none is specified', () => {
    const sec = new Security('test_key');
    expect(sec.getApiUrl()).toBe(DEFAULT_GITGUARDIAN_API_URL);
    expect(sec.getApiKey()).toBe('test_key');
    expect(sec.hasApiKey()).toBe(true);
  });

  it('supports EU API URL and removes trailing slash', () => {
    const sec = new Security('test_key', `${GITGUARDIAN_EU_API_URL}/`);
    expect(sec.getApiUrl()).toBe(GITGUARDIAN_EU_API_URL);
  });

  it('throws TypeError if apiUrl is invalid', () => {
    expect(() => new Security('key', 'not-a-valid-url')).toThrow(TypeError);
  });

  it('falls back to process.env.GITGUARDIAN_API_KEY if key is omitted', () => {
    process.env.GITGUARDIAN_API_KEY = 'env_secret_key';
    const sec = new Security();
    expect(sec.getApiKey()).toBe('env_secret_key');
    expect(sec.hasApiKey()).toBe(true);
  });

  it('builds standard GitGuardian headers with Token prefix', () => {
    const sec = new Security('my_api_key');
    const headers = sec.getHeaders();
    expect(headers).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'gitguardian-api-client/1.0.0',
      Authorization: 'Token my_api_key',
    });
  });

  it('omits Authorization header when no key is provided', () => {
    const sec = new Security();
    const headers = sec.getHeaders();
    expect(headers.Authorization).toBeUndefined();
    expect(headers.Accept).toBe('application/json');
  });
});
