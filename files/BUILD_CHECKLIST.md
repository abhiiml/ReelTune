# ReelTune — Pre-Build Checklist

## Accounts to create before you start (all free tier)

| Service | What for | Watch out for |
|---|---|---|
| **GitHub** | Repo | — |
| **Supabase** | Auth + Postgres + Storage | Free tier pauses after 7 days idle |
| **Spotify for Developers** | Search + playlist sync | New apps start in **Development Mode** — only 25 manually-added users can log in. Quota Extension requires a review. **Apply early.** |
| **Google Cloud Console** | YouTube Data API v3 | Default quota is **10,000 units/day**. A playlist insert costs 50 units, a search costs **100 units**. That's ~100 searches/day. Budget carefully or cache aggressively. |
| **AudD.io** or **ACRCloud** | Song recognition | AudD: simple REST, paid after trial. ACRCloud: more accurate, free tier available. |
| **Railway** | API + Postgres + Redis hosting | $5/mo credit free tier |
| **Expo (EAS)** | Mobile builds | Free tier has build queue limits |
| **Vercel** | Web app | Free |
| **Sentry** | Error tracking | Free tier fine |
| **PostHog** | Analytics | Free tier: 1M events/mo |
| **Apple Developer** | iOS TestFlight | **$99/year** — required for iOS |
| **Google Play Console** | Android testing | **$25 one-time** |

---

## Setup checklist

- [ ] GitHub repo created, `.gitignore` in place before first commit
- [ ] `pnpm` installed globally
- [ ] Docker installed (local Postgres + Redis)
- [ ] Node.js 20+ installed
- [ ] Supabase project created, email + Google auth enabled
- [ ] Spotify app registered, redirect URI added, **quota extension applied for**
- [ ] Google Cloud project created, YouTube Data API v3 enabled, OAuth consent screen configured
- [ ] Recognition provider account created, API key in hand
- [ ] `.env` files created from `env.example.txt` in `apps/api`, `apps/mobile`, `apps/web`
- [ ] `TOKEN_ENCRYPTION_KEY` generated (`openssl rand -hex 32`)
- [ ] Railway project created, Postgres + Redis provisioned
- [ ] Health-check endpoint deployed and returning 200 from a public URL
- [ ] `CLAUDE.md`, `TASKS.md`, `API_CONTRACTS.md`, `schema.prisma` committed to repo root

---

## The three real risks in this project

### 1. Instagram Reel audio access — the big one
Instagram does not offer a public API that gives you Reel audio or song metadata. Your PRD already flags this, and it is correct to treat it as the core technical risk rather than an assumption.

**What actually works reliably:**
- OS-level share sheet → your app receives the Reel **URL**
- User records ~10s of audio while the Reel plays → fingerprint it

**What is fragile or non-viable:**
- Scraping the Reel page for audio (breaks constantly, likely violates ToS)
- Assuming the share payload contains song metadata (it usually doesn't)

**Recommendation:** Build **TASK-603 (paste URL + record audio)** first and treat the share extension as an enhancement. If URL-based identification proves unreliable, the audio-recording path still makes the product work. Validate this in week one before building anything else on top of it — if recognition doesn't work, the rest of the app is a playlist manager.

### 2. Spotify Development Mode
Until your quota extension is approved, only users you manually whitelist (max 25) can connect Spotify. Fine for MVP testing, blocking for launch. Apply as soon as you have a working demo.

### 3. YouTube quota
100 searches/day on default quota will run out during a single sync of a large playlist. Mitigations: cache YouTube video IDs on the `Song` record permanently, only search for songs missing a `youtubeId`, and consider making YouTube sync P1 rather than P0.

---

## Working with the AI (practical tips for this project)

**Start every session:**
> "Read CLAUDE.md, API_CONTRACTS.md, and schema.prisma. I'm working on TASK-XXX from TASKS.md."

**One task per session.** When the AI starts contradicting earlier decisions, start a fresh session rather than arguing with it.

**Ask for a plan before code** on anything touching auth, OAuth, or the sync worker. Review the plan, then say "implement it."

**Commit after every green task.** `git commit -m "TASK-301: save song API"`. When something breaks three tasks later, you can bisect.

**When stuck, paste the exact error** — full stack trace, not a description.

**Build order matters.** Phases 0–4 are the safe, well-trodden part. Phase 6 (recognition) is the risky part. Consider doing a throwaway spike on recognition in week one — 50 lines of script that takes a Reel URL and tries to identify the song — before committing to the full build.

---

## Suggested timeline (solo, part-time)

| Weeks | Phases | Output |
|---|---|---|
| 1 | Recognition spike + Phase 0 | Does recognition work? Monorepo runs |
| 2 | Phase 1 | Auth works end to end |
| 3 | Phases 2–3 | Search, save, library |
| 4 | Phase 4 | Playlists |
| 5–6 | Phase 5 | Spotify OAuth + sync |
| 7–8 | Phase 6 | Recognition + Save from Reel |
| 9 | Phase 7 | YouTube |
| 10 | Phase 8 | Home, onboarding, polish |
| 11 | Phase 9 | Deployment, TestFlight |

Cut YouTube (Phase 7) first if you run short on time. It's marked P1 in your own PRD and it has the worst quota constraints.
