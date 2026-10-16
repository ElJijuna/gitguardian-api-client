import { GitGuardianClient } from '../dist/index.js';

async function main() {
  console.log('Testing gitguardian-api-client...');

  // Initialize client
  const apiKey = process.env.GITGUARDIAN_API_KEY || 'demo_api_key';
  const isDemo = !process.env.GITGUARDIAN_API_KEY;

  if (isDemo) {
    console.log('No GITGUARDIAN_API_KEY set; running in demo simulation mode.');
  }

  // Create client with request logger
  const gg = new GitGuardianClient({
    apiKey,
    ...(isDemo
      ? {
          fetch: async (url, init) => {
            console.log(`[Mock Fetch] ${init.method || 'GET'} ${url}`);
            if (url.includes('/v1/health')) {
              return new Response(JSON.stringify({ detail: 'Valid API key.' }), {
                status: 200,
                headers: { 'content-type': 'application/json' },
              });
            }
            if (url.includes('/v1/quotas')) {
              return new Response(
                JSON.stringify({
                  content: { count: 4, limit: 5000, remaining: 4996, since: '2024-01-01' },
                }),
                { status: 200, headers: { 'content-type': 'application/json' } },
              );
            }
            if (url.includes('/v1/scan')) {
              return new Response(
                JSON.stringify({
                  policy_break_count: 1,
                  policies: ['Secrets detection'],
                  policy_breaks: [
                    {
                      type: 'Generic High Entropy Secret',
                      policy: 'Secrets detection',
                      matches: [{ type: 'secret', match: 'sk_live_demo123456789' }],
                    },
                  ],
                  is_diff: false,
                }),
                { status: 200, headers: { 'content-type': 'application/json' } },
              );
            }
            if (url.includes('/v1/incidents/secrets/101')) {
              return new Response(
                JSON.stringify({
                  id: 101,
                  date: '2024-03-01T12:00:00Z',
                  detector: { name: 'slack_bot_token', display_name: 'Slack Bot Token' },
                  secret_hash: 'demo_hash',
                  status: 'TRIGGERED',
                  severity: 'critical',
                  validity: 'valid',
                  tags: ['DEFAULT_BRANCH'],
                }),
                { status: 200, headers: { 'content-type': 'application/json' } },
              );
            }
            if (url.includes('/v1/incidents/secrets')) {
              return new Response(
                JSON.stringify([
                  {
                    id: 101,
                    date: '2024-03-01T12:00:00Z',
                    detector: { name: 'slack_bot_token', display_name: 'Slack Bot Token' },
                    secret_hash: 'demo_hash',
                    status: 'TRIGGERED',
                    severity: 'critical',
                    validity: 'valid',
                    tags: ['DEFAULT_BRANCH'],
                  },
                ]),
                {
                  status: 200,
                  headers: {
                    'content-type': 'application/json',
                    link: '<https://api.gitguardian.com/v1/incidents/secrets?cursor=cD0xNTA%3D>; rel="next"',
                  },
                },
              );
            }
            return new Response(JSON.stringify({ detail: 'OK' }), {
              status: 200,
              headers: { 'content-type': 'application/json' },
            });
          },
        }
      : {}),
  });

  // Attach lifecycle event logger
  gg.on('request', (event) => {
    console.log(
      `  -> Event: ${event.method} ${event.url} [${event.statusCode}] (${event.durationMs}ms)`,
    );
  });

  // 1. Health check
  const health = await gg.health();
  console.log('Health check:', health);

  // 2. Scan content
  const scan = await gg.scan.text("API_KEY = 'sk_live_demo123456789'", 'config.py');
  console.log('Scan policy breaks found:', scan.policy_break_count);

  // 3. List incidents with cursor pagination
  const incidents = await gg.incidents.list({ status: 'TRIGGERED', per_page: 5 });
  console.log('Incidents fetched:', incidents.values.length);
  console.log('Has next page:', incidents.hasNextPage, 'Next cursor:', incidents.nextCursor);

  // 4. Incident chaining
  const incident = await gg.incident(101);
  console.log('Incident ID:', incident.id, 'Status:', incident.status);

  console.log('All test-client checks completed successfully!');
}

main().catch((err) => {
  console.error('Test client failed:', err);
  process.exit(1);
});
