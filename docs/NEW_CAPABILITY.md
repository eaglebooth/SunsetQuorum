# SunsetQuorum Demo API — Replacement Capability

Service ID: `sunset-demo-api`

Revision: `1`

The replacement capability is `GET /v2/customers/{id}/profile`. Consumers authenticate with OAuth 2 bearer tokens carrying `profile:read`. A successful response contains `{ "id", "displayName" }`. Missing records return HTTP 404 with an RFC 9457 problem document.

The replacement is not considered adopted merely because it exists. Each registered consumer must demonstrate its own endpoint mapping, authentication migration, error handling, regression result, and rollback procedure.
