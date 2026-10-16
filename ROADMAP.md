# Roadmap

This document outlines the planned milestones and release schedule for `gitguardian-api-client`.

---

## Current Release: v1.0.0

- [x] Zero-dependency TypeScript REST client using Node 18+ native `fetch`.
- [x] Dual ESM & CommonJS distribution (`dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`).
- [x] Authentication supporting `Token <key>` and environment variable `GITGUARDIAN_API_KEY`.
- [x] Multi-region support: US (`https://api.gitguardian.com`), EU (`https://api.eu1.gitguardian.com`), and self-hosted instances.
- [x] Cursor-based pagination with `GitGuardianPagedResponse<T>`.
- [x] Content scanning: single scan, multiscan, and scan with incident creation.
- [x] Secret incidents management: list, get, resolve, ignore, reopen, assign, unassign, share, notes, activity logs, locations.
- [x] Decoy honeytokens: list, create, reset, revoke, events, notes.
- [x] Sources & repositories: list, get, update monitoring status, incidents, locations.
- [x] Workspace teams & members.
- [x] Audit logs and event names.
- [x] Secret detectors catalog.
- [x] Client lifecycle event emitter (`client.on('request', ...)`).
- [x] Robust error handling with `GitGuardianApiError`.

---

## Future Milestones: v1.1.0+

- [ ] Built-in async iterator for automatic pagination across all pages (`for await (const incident of gg.incidents.iterate())`).
- [ ] Automatic retry on rate limits (HTTP 429) respecting `Retry-After` header.
- [ ] Pre-commit hook helper utilities and git diff parsing helpers.
- [ ] SCIM v2 User and Group provisioning resources.

