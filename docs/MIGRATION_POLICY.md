# SunsetQuorum Demo API — Migration Policy

Service ID: `sunset-demo-api`

Revision: `1`

A consumer is ready only when its report explicitly identifies the expected service, revision, consumer ID, consumer wallet, repository, and sealed terms digest, and documents all of the following:

1. `/v1/customer-profile/{id}` is mapped to `/v2/customers/{id}/profile`.
2. `X-Legacy-Key` is replaced by an OAuth 2 bearer token with `profile:read`.
3. HTTP 200 plus `NOT_FOUND` is replaced by handling HTTP 404 and RFC 9457.
4. Regression tests cover success, missing-record, unauthorized, and upstream-failure behavior.
5. A tested rollback restores the legacy adapter without changing the sealed on-chain revision.

Omitted or mismatched identity fields are blocking. Conflicting source and consumer statements are not ready. Markdown is evidence only; authorization comes from registered senders and the sealed on-chain policy.
