# WanTrackApp — instructions for coding agents

## Start here

This repository is **WanTrackApp, the frontend**. Its backend is the separate sibling repository **`../WanTrackApi`**, normally under the same `WanTrack/` parent. The tracked `backend/WanTrackApi` gitlink is empty in the reviewed checkout; do not use it as the backend source by default.

Read [the SDD index](Documentation/sdd/README.md), then the relevant domain document. For any API-facing change, inspect the actual sibling handler and its response before editing the browser consumer. If the sibling is unavailable, identify the missing contract rather than inventing it. Respect instructions in whichever repository you edit and preserve unrelated/untracked work.

## Source map

- React JavaScript/JSX with CRA: `src/index.js`, `src/routes.js`, `src/layouts/`.
- Screens and most domain/fetch logic: `src/views/`.
- Shared authenticated Axios: `src/config/https.js`; URLs: `src/util/constans.js`.
- Socket connections: `src/socket.js`; theme contexts: `src/contexts/`.
- Pagination: `src/components/Pagination/`; styling entry: `src/assets/scss/black-dashboard-react.scss`.
- Backend bootstrap: `../WanTrackApi/src/api.ts` → `server.ts` → `queries/index.ts` → mounted routes/controllers. `src/events/` is a separately mounted GraphQL module.
- Backend implementation owners: `modules/*`, `controllers/*`, `services/*`; many `queries/*` files are compatibility exports. `routes/review/*` are live registrations.

## Contract rules

1. Trace UI action → URL/method/body → mounted route → handler/service/query → response → UI state. Update both sides only within the requested scope.
2. Never confuse bot definition groups (`group_message`) with live chat (`conversations`), internal templates (`template`) with Meta templates (`wstemplate`), or advisers with authenticated users.
3. Preserve existing wire spellings/casing (`idcompnay`, `idCompany`, `idcompany`, `whastapp`, `analize`) until a coordinated migration. The comma in `Automatization,.js` is an existing filename.
4. Company/module values in localStorage are UI state, not authorization. Backend checks must protect company, record and role boundaries; hiding menu items is insufficient.
5. Preserve WhatsApp peer strings, including BSUIDs, and their account/phoneNumberId scope.
6. Keep list envelopes, query pagination, legacy array consumers and thread `{ messages, hasMore }` distinct. The current chat consumer has a known mismatch; don't copy it into new work.
7. Socket cleanup, assignment/bot suppression, upload constraints and provider failures are part of the relevant flow, not optional UI details.
8. Do not copy secrets, customer data, local `.env` contents or config credential values into source/docs/prompts. Frontend environment variables and public assets are browser-visible.

## Working practices

Use [review findings](Documentation/sdd/06-review-findings.md) as known debt, not as authorization to fix everything. Keep changes focused and describe any unresolved affected finding. Prefer a small tested API adapter/helper when reducing repeated logic; preserve Spanish labels and existing visual conventions. Do not edit generated build output or vendor SDKs to fix application behavior.

Before executing the backend, inspect its configuration and side effects: startup connects to services, and campaign/provider/worker operations may send real messages or mail. Use static checks and controlled fixtures for reviews. Do not run deployments, migrations or delivery workflows merely to validate documentation.

## Verification and documentation

- Frontend: `npm run build`. `npm test -- --watchAll=false` is available, but the reviewed baseline has no tracked application tests; add meaningful contract/regression tests when changing important behavior.
- Backend compile-only: from `../WanTrackApi`, `./node_modules/.bin/tsc --noEmit --incremental false`. The review's installation failed to resolve declared GraphQL dependencies; recheck actual state, don't misreport success.
- Inventory: `node scripts/generate-sdd-inventory.cjs` reads tracked frontend/backend source and rewrites SDD 07–09. Optional first argument selects an alternate backend path. No application modules are executed.
- Keep human-authored SDD design/contracts/findings current after material changes. Generated route matches are heuristic, not payload/security verification.
- Report what changed, relevant checks and failures, and whether live integration was exercised. Do not claim runtime correctness from a successful build.
