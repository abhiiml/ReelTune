# ReelTune Testing Strategy

## Test pyramid
1. Unit: pure functions, validators, matching/scoring logic.
2. Integration: NestJS endpoints with test DB/mocks.
3. Contract: API schemas and provider adapters.
4. E2E: critical mobile/web flows.

## Must-have flows
- Auth login/logout/session restore.
- Search -> save song -> saved library.
- Create playlist -> add/remove/reorder.
- Reel URL -> recognition job -> successful match.
- Low-confidence recognition -> candidate selection.
- Connect Spotify -> sync playlist -> per-track result.
- Disconnect provider.

## Provider policy
Use mocked Spotify/YouTube responses in automated tests. Never depend on live provider APIs for normal CI.

## Acceptance checklist per task
- Happy path test.
- At least one validation/error test.
- Authorization test for protected resource.
- Regression test for any bug fixed.
- Typecheck + lint.

## Commands
Expected package scripts: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`.
