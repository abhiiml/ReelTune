# ReelTune Progress

## Fully Complete ✅
- ✅ **TASK-001: Initialize Monorepo**
  - Created `pnpm` workspaces for `apps/*` and `packages/*`.
  - Stubbed packages (`config`, `types`, `utils`) with baseline TS configuration.
  - Successfully configured and ignored necessary root folders (`.gitignore`).
- ✅ **TASK-002: API Scaffold**
  - Initialized NestJS app in `apps/api`.
  - Added Prisma & PostgreSQL connection (`DATABASE_URL`).
  - Implemented health check endpoint (`GET /api/v1/health` -> `{"status":"ok"}`).
  - Set up global `ValidationPipe` with `class-validator` and `class-transformer`.
  - Resolved pnpm build script warnings using `allowBuilds` in `pnpm-workspace.yaml`.

## In Progress 🚧
- 🚧 **TASK-003: Mobile App Scaffold**
  - **Status**: Scaffolded Expo template with `--template tabs`.
  - **Where it's at**: Successfully ran the CLI scaffolding. Currently cleaning up Expo's default `npm install` footprint to align with the `pnpm` workspace, followed by installing fonts and NativeWind.

## Decisions Made (Not in SKILLS.md)
- **Monorepo Root**: Placed directly at `c:\Users\ASUS\Desktop\ReelTune` rather than creating a nested `reeltune/` subdirectory to keep paths simple.
- **pnpm Build Script Approvals**: Used `allowBuilds` inside `pnpm-workspace.yaml` instead of `.npmrc` or `package.json` to properly satisfy strict pnpm `v12` lifecycle script restrictions (`ERR_PNPM_IGNORED_BUILDS`) for Prisma, NestJS, and esbuild.

## Gotchas / Watch Out For
- **`ERR_PNPM_IGNORED_BUILDS` in pnpm v12**: `pnpm` now strictly requires you to explicitly allow build scripts for native modules. Future native modules added to the monorepo will require appending to `allowBuilds` in `pnpm-workspace.yaml`.
- **Expo Scaffolding**: The `create-expo-app` command defaults to installing dependencies using `npm`, creating local `node_modules` and `package-lock.json`. These must be actively cleaned up to prevent `pnpm` workspace conflicts.

## Exact Next Step
- Complete **TASK-003**: 
  - Rename mobile package to `@reeltune/mobile`.
  - Add Expo Router.
  - Configure NativeWind (TailwindCSS for React Native).
  - Install `Manrope` via `expo-font`.
  - Set up theme constants (from design system).
  - Modify the tab shell (Home, Search, Save, Library, Profile) in `apps/mobile/app/(tabs)`.
