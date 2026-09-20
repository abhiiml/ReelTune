# LLM Layer Rules (Only if ReelTune adds AI features)

## Scope
AI is an optional product layer. Core saving, recognition, playlists, and sync must work without an LLM.

## Prompt storage
Store versioned templates in `apps/api/src/ai/prompts/`. Each prompt has a stable name and version.

## Structured outputs
Any LLM result consumed by code must conform to a JSON schema and be validated before use. Never parse free-form prose as business logic.

## Reliability
- Timeout every model call.
- Retry only transient failures with exponential backoff.
- Set max input/output sizes.
- Add per-user and global rate limits.
- Add cost budgets.
- Never send OAuth tokens, passwords, or unnecessary personal data to the model.

## Evaluation
Maintain 10-20 representative examples under `docs/evals/` with expected structured outputs. Run evals when prompts/models change.

## Logging
Log request ID, prompt version, latency, token/cost metadata, validation status, and provider error codes. Do not log raw secrets or sensitive user content unless explicitly required and protected.

## Candidate AI features
- Natural-language playlist creation.
- Smart playlist organization.
- Song metadata cleanup.
- Explanations of why a song was matched.

Do not make an LLM responsible for deterministic provider IDs, OAuth, authorization, or final sync decisions.
