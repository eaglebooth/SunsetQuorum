# SunsetQuorum Demo API — Legacy Capability

Service ID: `sunset-demo-api`

Revision: `1`

The legacy capability is `GET /v1/customer-profile/{id}`. Consumers authenticate with the `X-Legacy-Key` header. A successful response contains `{ "customer": { "id", "display_name" } }`. Missing records return HTTP 200 with `{ "customer": null, "error": "NOT_FOUND" }`.

This capability must remain available until every registered consumer has consented to the sealed revision and supplied identity-bound migration evidence.
