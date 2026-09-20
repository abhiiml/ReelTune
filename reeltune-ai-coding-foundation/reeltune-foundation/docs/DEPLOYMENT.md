# Deployment Path

## Environments
- local: Docker/local Postgres + Redis
- staging: Railway API/worker + managed Postgres/Redis + Vercel preview
- production: Railway API/worker + managed Postgres/Redis + Vercel + Expo EAS

## First deployment
1. Deploy `/health` API endpoint.
2. Deploy web shell.
3. Verify environment variables.
4. Run DB migrations.
5. Run worker health check.
6. Add OAuth redirect URIs for staging.
7. Run smoke tests.

## Release rules
- Database migration must be backward compatible where possible.
- Never deploy untested migrations directly to production.
- Roll back application before rolling back irreversible schema changes.
- Monitor error rate, latency, recognition success, sync failures, and provider rate-limit errors.
