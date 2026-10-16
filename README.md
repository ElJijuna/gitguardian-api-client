# gitguardian-api-client

[![npm version](https://img.shields.io/npm/v/gitguardian-api-client.svg)](https://www.npmjs.com/package/gitguardian-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

A modern, zero-dependency TypeScript client library for the [GitGuardian REST API](https://docs.gitguardian.com/api-docs/).

Built with **pure native fetch** (no external HTTP dependencies), offering **fluent resource chaining**, full **TypeScript definitions**, **cursor-based pagination**, and dual **ESM & CommonJS** distribution.

---

## Features

- **Zero Runtime Dependencies**: Uses Node.js 18+ native `fetch`, `AbortSignal`, and `URL`.
- **Dual ESM & CommonJS**: Full support for both `import` and `require()`.
- **Fluent Resource Chaining**: Intuitive ergonomics using `PromiseLike` (e.g. `await gg.incident(42)` or `await gg.incident(42).notes()`).
- **Complete GitGuardian API Coverage**:
  - **Scanning**: Test strings, documents, or batches (`multiscan`) for secret leaks and policy breaks.
  - **Secret Incidents**: List, filter, assign, resolve, ignore, reopen, share, and manage remediation notes and activity logs.
  - **Occurrences**: Track exact file locations, commit SHAs, and presence.
  - **Honeytokens**: Create, reset, revoke, and monitor decoy credentials.
  - **Sources**: Inspect monitored repositories and toggle scanning.
  - **Teams & Members**: Manage workspace access and team permissions.
  - **Audit Logs**: Query security and user activity logs.
  - **Health & Quotas**: Real-time service status and scan quota monitoring.
- **Multi-Region & Self-Hosted**: Configurable for US (`https://api.gitguardian.com`), Europe (`https://api.eu1.gitguardian.com`), and on-premise deployments.
- **Cursor Pagination**: Transparent next-page navigation via standard `Link` headers.
- **Observable**: Built-in request event listener (`client.on('request', ...)`) for metrics, debugging, and tracing.
- **Rich Error Handling**: Typed `GitGuardianApiError` with detailed server messages and status codes.

---

## Installation

```bash
npm install gitguardian-api-client
```

Or using pnpm / yarn:

```bash
pnpm add gitguardian-api-client
# or
yarn add gitguardian-api-client
```

---

## Quick Start

```typescript
import { GitGuardianClient } from 'gitguardian-api-client';

// Initializes with your API key, or reads GITGUARDIAN_API_KEY from process.env
const gg = new GitGuardianClient({ apiKey: 'YOUR_API_KEY' });

// 1. Health check & quota overview
const health = await gg.health();
console.log('Status:', health.detail); // 'Valid API key.'

const quota = await gg.quotas();
console.log(`Remaining scans: ${quota.content.remaining}/${quota.content.limit}`);

// 2. Scan code for secrets
const scan = await gg.scan.text(
  "DATABASE_URL = 'postgres://user:password123@db.prod.internal:5432/main'",
  "config.py"
);

if (scan.policy_break_count > 0) {
  console.log(`Found ${scan.policy_break_count} policy break(s)!`);
  for (const pb of scan.policy_breaks) {
    console.log(`- [${pb.type}] ${pb.policy} (validity: ${pb.validity})`);
  }
}
```

---

## Authentication & Regions

All GitGuardian requests use token authentication: `Authorization: Token <API_KEY>`.

### Environment Variable

If no `apiKey` is passed to the constructor, the client automatically falls back to `process.env.GITGUARDIAN_API_KEY`:

```typescript
const gg = new GitGuardianClient();
```

### Multi-Region (US, Europe, Self-Hosted)

GitGuardian operates multiple data centers. You can override `apiUrl`:

```typescript
import { GitGuardianClient, GITGUARDIAN_EU_API_URL } from 'gitguardian-api-client';

// European Region
const ggEu = new GitGuardianClient({
  apiKey: 'YOUR_EU_KEY',
  apiUrl: GITGUARDIAN_EU_API_URL, // https://api.eu1.gitguardian.com
});

// Self-Hosted / On-Premise
const ggOnPrem = new GitGuardianClient({
  apiKey: 'YOUR_KEY',
  apiUrl: 'https://gitguardian.company.internal/exposed',
});
```

---

## Usage Guide

### 1. Content Scanning (`gg.scan`)

Scan raw text, individual files, or document batches:

```typescript
// Scan text
const result = await gg.scan.text("AWS_SECRET = 'AKIAIOSFODNN7EXAMPLE'");

// Scan file with filename context (enables filename policy rules like .env)
const envResult = await gg.scan.file("SECRET_KEY=12345", ".env");

// Multiscan (multiple documents in a single request)
const results = await gg.scan.multiple([
  { document: "API_KEY = '12345'", filename: "settings.py" },
  { document: "TOKEN = 'xyz'", filename: "ci.yml" },
]);

// Scan and automatically open incidents in your GitGuardian dashboard
const incResult = await gg.scan.createIncidents({
  document: "SLACK_WEBHOOK = 'https://hooks.slack.com/...'",
  filename: "alerts.go",
  source_id: 123, // optional source ID
});
```

---

### 2. Secret Incidents (`gg.incidents` & `gg.incident(id)`)

#### Listing Incidents with Filtering & Cursor Pagination

```typescript
// Query incidents with filters
const paged = await gg.incidents.list({
  status: 'TRIGGERED',
  severity: 'critical',
  per_page: 50,
});

for (const inc of paged.values) {
  console.log(`#${inc.id} - ${inc.detector.display_name} (${inc.severity})`);
}

// Paginate forward using cursor
if (paged.hasNextPage) {
  const nextPage = await gg.incidents.list({
    status: 'TRIGGERED',
    cursor: paged.nextCursor,
  });
}
```

#### Incident Chaining & Remediation Actions

Individual incidents can be awaited directly or chained with remediation actions:

```typescript
// Direct await
const incident = await gg.incident(101);

// Resolve incident
await gg.incident(101).resolve({ secret_revoked: true });

// Ignore as false positive or test credential
await gg.incident(101).ignore({ ignore_reason: 'test_credential' });

// Reopen incident
await gg.incident(101).reopen();

// Assign / Unassign
await gg.incident(101).assign({ email: 'security@example.com' });
await gg.incident(101).unassign();

// Generate public sharing link
const { share_url } = await gg.incident(101).share({ auto_healing: true });
await gg.incident(101).unshare();

// Remediation notes
const notes = await gg.incident(101).notes();
await gg.incident(101).addNote('Credential rotated in Vault and verified.');
await gg.incident(101).deleteNote(noteId);

// Activity history & occurrences
const logs = await gg.incident(101).activityLogs();
const locations = await gg.incident(101).locations();
```

---

### 3. Decoy Honeytokens (`gg.honeytokens` & `gg.honeytoken(id)`)

Manage canary decoy credentials:

```typescript
// Create a new honeytoken
const token = await gg.honeytokens.create({
  name: 'Production DB Decoy',
  type: 'AWS',
  description: 'Placed in staging configs to detect unauthorized access',
});

console.log('Decoy Access Key:', token.token?.aws_access_key_id);

// Check honeytoken state
const h = await gg.honeytoken(token.id);

// Check access events triggered by someone attempting to use the token
const events = await gg.honeytoken(token.id).events();

// Reset or Revoke
await gg.honeytoken(token.id).reset();
await gg.honeytoken(token.id).revoke();
```

---

### 4. Sources & Monitored Repositories (`gg.sources` & `gg.source(id)`)

```typescript
// List monitored repositories
const sources = await gg.sources.list({ monitored: true });

// Direct await on source
const repo = await gg.source(42);
console.log(`${repo.full_name}: ${repo.open_incidents_count} open incident(s)`);

// Toggle monitoring
await gg.source(42).update({ monitored: false });

// Retrieve incidents detected on this source
const sourceIncidents = await gg.source(42).incidents();
```

---

### 5. Workspace Teams, Members, and Audit Logs

```typescript
// Workspace members
const members = await gg.members.list();
const member = await gg.members.get(1);

// Teams
const teams = await gg.teams.list();
const newTeam = await gg.teams.create({ name: 'Backend Sec', is_global: false });
await gg.teams.delete(newTeam.id);

// Audit logs
const auditLogs = await gg.auditLogs.list({ date_after: '2024-01-01T00:00:00Z' });
const eventNames = await gg.auditLogs.eventNames();

// Secret Detectors
const detectors = await gg.secretDetectors.list();
const detector = await gg.secretDetectors.get('slack_bot_token');
```

---

## Request Events & Observability

`GitGuardianClient` emits a `request` event on every outgoing HTTP request, useful for structured logging, APM metrics, or debugging:

```typescript
gg.on('request', (event) => {
  console.log(`[${event.method}] ${event.url} -> ${event.statusCode} (${event.durationMs}ms)`);
  if (event.error) {
    console.error('Request failed:', event.error);
  }
});
```

---

## Error Handling

Non-2xx HTTP responses throw a typed `GitGuardianApiError` with parsed error details:

```typescript
import { GitGuardianClient, GitGuardianApiError } from 'gitguardian-api-client';

try {
  await gg.incident(999999);
} catch (err) {
  if (err instanceof GitGuardianApiError) {
    console.error('Status:', err.status);         // 404
    console.error('Status Text:', err.statusText); // 'Not Found'
    console.error('Detail:', err.detail);         // 'Not found.'
    console.error('Body:', err.body);
  }
}
```

---

## Development & Testing

```bash
# Run tests with Jest
npm test

# Run tests with coverage
npm run test:coverage

# Run TypeScript type check
npm run typecheck

# Check code formatting with Biome
npm run format:check

# Run linter with ESLint
npm run lint

# Build ESM & CJS distribution with tsup
npm run build

# Run end-to-end test-client verification
npm run test:client

# Run full CI check suite
npm run check
```

---

## License

[MIT](LICENSE) © [pilmee](https://github.com/ElJijuna)

