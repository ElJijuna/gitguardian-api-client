// Client
export { GitGuardianClient } from './GitGuardianClient';
export type {
  GitGuardianClientOptions,
  RequestEvent,
  GitGuardianClientEvents,
} from './GitGuardianClient';

// Security & Constants
export {
  Security,
  DEFAULT_GITGUARDIAN_API_URL,
  GITGUARDIAN_EU_API_URL,
} from './security/Security';

// Errors
export { GitGuardianApiError } from './errors/GitGuardianApiError';

// Resources
export { ScanResource } from './resources/ScanResource';
export { SecretIncidentsResource } from './resources/SecretIncidentsResource';
export { SecretIncidentResource } from './resources/SecretIncidentResource';
export { SecretOccurrencesResource } from './resources/SecretOccurrencesResource';
export { SourcesResource } from './resources/SourcesResource';
export { SourceResource } from './resources/SourceResource';
export { HoneytokensResource } from './resources/HoneytokensResource';
export { HoneytokenResource } from './resources/HoneytokenResource';
export { MembersResource } from './resources/MembersResource';
export { TeamsResource } from './resources/TeamsResource';
export { AuditLogsResource } from './resources/AuditLogsResource';
export { SecretDetectorsResource } from './resources/SecretDetectorsResource';
export { ApiTokensResource } from './resources/ApiTokensResource';

// Domain Types
export type {
  PaginationParams,
  GitGuardianPagedResponse,
} from './domain/Pagination';

export type {
  HealthStatus,
  QuotaOverview,
  GitGuardianIps,
} from './domain/Health';

export type {
  ScanDocument,
  PolicyMatch,
  PolicyBreak,
  ScanResult,
  ScanCreateIncidentsPayload,
} from './domain/Scan';

export type {
  IncidentStatus,
  IncidentSeverity,
  IncidentValidity,
  IncidentTag,
  IncidentDetector,
  SecretIncident,
  IncidentNote,
  IncidentActivityLog,
  IncidentLocation,
  ListIncidentsParams,
  ResolveIncidentData,
  IgnoreIncidentData,
  AssignIncidentData,
  ShareIncidentData,
  NoteData,
} from './domain/Incident';

export type {
  SecretOccurrence,
  ListOccurrencesParams,
} from './domain/Occurrence';

export type {
  HoneytokenStatus,
  Honeytoken,
  CreateHoneytokenData,
  UpdateHoneytokenData,
  HoneytokenEvent,
  ListHoneytokensParams,
} from './domain/Honeytoken';

export type {
  Source,
  UpdateSourceData,
  ListSourcesParams,
} from './domain/Source';

export type {
  MemberRole,
  Member,
  ListMembersParams,
} from './domain/Member';

export type {
  Team,
  CreateTeamData,
  UpdateTeamData,
  ListTeamsParams,
} from './domain/Team';

export type {
  AuditLog,
  ListAuditLogsParams,
} from './domain/AuditLog';

export type {
  SecretDetector,
  ListDetectorsParams,
} from './domain/Detector';

export type {
  ApiToken,
  CreateApiTokenData,
  ListApiTokensParams,
} from './domain/ApiToken';
