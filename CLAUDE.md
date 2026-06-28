# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Tốc Chiến Counter — an Expo (React Native) mobile app for Liên Minh: Tốc Chiến (Wild Rift). It reads the enemy team from a screenshot via AI vision, then suggests counter builds, runes, summoner spells, and champion picks/bans. It also browses champions/items and tracks news/tier-list/builds that auto-follow the current patch. The codebase and code comments are in Vietnamese.

There are two halves:
- **App** (`App.js`, `src/`) — the Expo client.
- **Backend** (`backend/`) — Vercel serverless functions. They hold `ANTHROPIC_API_KEY` and proxy all AI + scraping calls. The client never sees the key.

## Commands

```bash
npm install
npx expo start            # dev; scan QR with Expo Go (phone + machine on same wifi)
npx expo start --android  # or: npm run android / ios / web
```

There is **no test, lint, or typecheck setup** — this is plain JS (no TypeScript, no test runner). Verify changes by running the app.

Backend deploy (Vercel):
```bash
cd backend
npx vercel ; npx vercel env add ANTHROPIC_API_KEY ; npx vercel --prod
```

APK / OTA:
```bash
npx eas-cli build --platform android --profile preview
npx eas-cli update --branch preview --message "..."
```

## Two things required before AI works

1. Deploy `backend/` to Vercel with `ANTHROPIC_API_KEY` set.
2. `BACKEND_URL` in [src/lib/api.js](src/lib/api.js) must point at it. This constant is the **single source** of the backend URL for the whole app. For a local backend use the machine's LAN IP (e.g. `http://192.168.1.10:3000`), never `localhost` (the phone can't resolve the machine's localhost).

## Architecture

### Navigation (no router library)
[App.js](App.js) is the whole navigator: a 5-tab bar driving hand-rolled sub-flows via `useState`, not React Navigation. Two independent multi-step flows keep **separate session state** so they don't bleed into each other:
- **Build** flow: `setup → confirm → (picks | result)`, plus `history`. State in `buildSession`.
- **Đội hình / Suggest** flow: `input → picks → result`. State in `suggestSession`.

`PickScreen` and `ResultScreen` are shared by both flows; each flow passes its own `session` + `patch` (merge-setter) + callbacks. When adding a screen, wire it into `App.js`'s conditional render and the matching `*Screen`/`*Session` setters.

### Backend API surface (`backend/api/`)
- `analyze.js` — the one AI endpoint, switched by `mode`: `extract` (vision: screenshot → champion list), `analyze` (counter build), `suggest` (champion picks). Uses Sonnet 4.6 for both extract and analyze (`EXTRACT_MODEL`/`ANALYZE_MODEL` consts), with thinking disabled + low effort for speed. Self-aborts at 55s (Vercel 60s cap) so the client gets a readable JSON error.
- `items.js`, `tierlist.js`, `champbuild.js`, `news.js` — scrapers (mostly lolwildriftbuild.com + the official site). All **degrade soft**: on any error they return empty (never 500) so the client falls back to cache / static DB.
- `version.js` — minimum app version, used to force-update.

### LIVE data vs static DB — the core split
The app layers two data sources, and this distinction matters for almost any data change:

- **Static DB** (`src/data/`) is the *tagged core* the AI reasons over. It is hand-maintained:
  - `champions.js` — champions with `damageType/role/burst/cc/healing/threat` tags + build-identity. Exports `CHAMPION_ALLOWLIST`, `findChampion`, `BUILD_LABELS`.
  - `items.js` — items (`name` EN = allowlist key, `vi`, `type`, `tags`, `desc`). `ITEM_ALLOWLIST` and the AI catalog are derived from `ITEMS`; `itemCatalogForDamage(dmg)` filters AD/AP items before sending to the AI.
  - `runes.js` — `KEYSTONE_CATALOG`, `SPELL_CATALOG`.
  - `buildTemplates.js` — offline fallback builds for 12 archetypes.
- **Live data** (`src/lib/liveData.js`) is a tiny reactive store (`useSyncExternalStore`) holding scraped item catalog (real WR names + icons) and DDragon-derived champion metadata for champs not yet in the static DB. It is a **neutral module** — it must NOT import `data/` or `lib/api` (avoids circular imports). Components call `useLiveData()` to re-render when data arrives (it may arrive after first render, from cache then network).

Mental model: static DB = depth/accuracy for AI grounding; live data = up-to-date names/icons/builds. New champions appear automatically via the tier list even without a static-DB entry, but adding them to `champions.js` makes the AI analysis deeper.

### Anti-hallucination ("đồ ma") — allowlists
The AI is only allowed to pick items/runes/spells/champions from the catalogs sent in the request ([src/lib/api.js](src/lib/api.js) builds these). Anything outside the static DB is badged `⚠ NGOÀI DS` in the result screen. When extending what the AI can output, the new option must be in the corresponding catalog/allowlist or it will be flagged/filtered.

### Name matching
`nameKey()` / `slugify()` in [src/theme.js](src/theme.js) are the **single source** for normalizing names (strips Vietnamese diacritics, typographic quotes `'`/`'`, whitespace). Always match item/rune/champion names through `nameKey()` — never compare raw strings. (See the memory note: `items.js` is the source of truth for item names; scraped sources mix in LoL-PC item names — don't guess WR item names from PC.)

### Caching & resilience
- `cachedResolve(key, ttl, fetcher, apply)` in [src/lib/storage.js](src/lib/storage.js) is the shared cache-first helper (AsyncStorage) for version / roster / item catalog / champ build. It applies cached data immediately, then refetches only past TTL.
- `repairJson.js` salvages truncated AI JSON (token cutoff) by balancing brackets/strings.
- `ErrorBoundary` ([src/components/ErrorBoundary.js](src/components/ErrorBoundary.js)) wraps the app so one screen's render error doesn't crash everything.
- News is fetched once in `NewsProvider` ([src/lib/newsContext.js](src/lib/newsContext.js)) and shared between the header (patch number) and `HomeScreen`.
- Offline analysis (no AI call): `draftAnalysis.js` (team profile + ban suggestions) and `matchup.js` (1v1 lane tips) run purely on static DB.

### Theming
[src/theme.js](src/theme.js) holds all design tokens (`C` colors, `GRAD` gradients, `glow()`, `TIER_COLOR`). Neon/esports purple+cyan look. Keep token names stable — screens depend on them. Use `glow()` for neon shadows rather than ad-hoc shadow styles.
