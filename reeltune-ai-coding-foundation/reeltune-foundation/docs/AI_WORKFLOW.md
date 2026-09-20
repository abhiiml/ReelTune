# AI Coding Workflow

## Session protocol
1. Read `AGENTS.md`.
2. Read only the relevant sections of `PLAN.md`, `DATA_MODEL.md`, `API_CONTRACTS.md`, and `DESIGN_SYSTEM.md`.
3. State the current task ID and acceptance criteria.
4. Inspect existing code before proposing changes.
5. Produce a short implementation plan.
6. Implement only that task.
7. Add tests alongside the implementation.
8. Run typecheck/lint/tests.
9. Review the diff for unrelated changes, secrets, API drift, and duplicated logic.
10. Commit only after the task passes.

## If AI gets confused
Start a fresh session. Provide:
- relevant rule file section
- exact task
- relevant files
- exact error output
- current test result

Do not paste the whole repository unless necessary.

## Prompt template
"You are working on ReelTune. Read AGENTS.md and the relevant docs first. Implement task TXXX only. First give a short plan and list files you expect to change. Then code. Add/update tests for every acceptance criterion. Do not change public API contracts or architecture unless the task explicitly requires it. Run lint, typecheck, and relevant tests. Finish with files changed, commands run, results, and any unresolved issue."

## Diff review checklist
- Is every changed file necessary?
- Did names match existing conventions?
- Did the API shape remain compatible?
- Are authorization checks present?
- Are external calls bounded by timeout/retry/rate limit?
- Are tokens/secrets protected?
- Are tests meaningful rather than snapshots only?
- Did generated code introduce dead dependencies?
