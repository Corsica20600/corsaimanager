# Test schema and current release boundary

A — immutable historical migrations: create-crm-tables.sql,
20260905-crm-foundations.sql, 20260907-commercial-history.sql,
create-leads-table.sql and 20260907-crm-lead-link.sql. Historical deployment is
reported in project context, not re-verified against Production in this task.
commercial-history replaced the old four-kind CHECK with the email event CHECK.
Do not edit/replay it to initialize the current release tests.

B — current release: the explicit list in scripts/release-migrations.json
(rehabilitation and versioned sequence projection). The guard rejects removal
and non-additive statements only for these files.

C — test baseline: crm-baseline.sql consolidates A, creating the final historical
CHECK once. check-test-baseline.mjs verifies the deterministic text consolidation
against A without executing A. The PostgreSQL fixture submits C, then B.
No historical rows are copied. Constraint checks and IDs are tested with fixtures.
Fault-injection constraints are transactional and rolled back, not removed.

D — no file deleted or declared obsolete: historical migrations remain references.

## Local reproduction

Use PostgreSQL Windows on 127.0.0.1:55439 and dedicated crm_foundations_test.
.env.release.local (ignored by Git) supplies CRM_TEST_DATABASE_URL. Standalone
test commands explicitly load it. validate:release overrides DATABASE_URL only
inside its child processes, never changing application/Production configuration.

Run npm run validate:release. It checks the snapshot and release manifest, then
typecheck, lint, all tests, critical PostgreSQL tests and build.
To test from zero, recreate only this disposable database, owned by ai_team_test,
before the command. Never target an application database. Ordinary fixture cleanup
uses controlled TRUNCATE; it does not change release constraints.

Do not use the Ubuntu cluster also listening on 55439 inside WSL: Windows localhost
currently reaches native postgres.exe. Verify the listener when moving machines.
