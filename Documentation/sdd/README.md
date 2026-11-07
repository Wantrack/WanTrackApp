# WanTrackApp software design documents

Reviewed 2026-11-07. This is an **as-built design and static review**, not a claim that all flows work. WanTrackApp is the browser frontend; the sibling **WanTrackApi is its backend**. The review produces documentation only; application defects below remain unfixed.

## Reading order

1. [System and repository relationship](01-system-design.md)
2. [Frontend folders, screens and state](02-frontend-design.md)
3. [Backend domains and data](03-backend-design.md)
4. [Integration contracts and workflows](04-contracts-and-flows.md)
5. [Configuration, validation and operations](05-operations.md)
6. [Prioritized review findings](06-review-findings.md)
7. [Every tracked frontend file](07-file-inventory.md)
8. [Frontend requests and backend routes](08-api-relationship.md)
9. [Backend controllers and methods](09-controller-index.md)
10. [Decisions and future change checklist](10-decisions.md)

AI entry points: [AGENTS.md](../../AGENTS.md), [CLAUDE.md](../../CLAUDE.md), and [CHATGPT.md](../../CHATGPT.md). They share this documentation instead of maintaining separate, conflicting designs.

## Coverage and limits

The initial frontend baseline has 166 tracked entries, including its empty backend gitlink, all 38 view files, supporting JavaScript, SCSS, public resources and historical documentation. Every tracked frontend text file is read by the inventory generator; all first-party JavaScript is parsed. Backend TypeScript is structurally scanned across controllers, routes, services, interfaces, infrastructure and integrations. The controller index includes legacy re-exports and unmounted controllers, not just route handlers. Critical request/response, authentication, persistence and side-effect paths receive manual inspection.

The final generated snapshot contains 178 frontend request/URL-reference entries, 279 mounted backend registrations (including the GraphQL mount), 59 legacy route declarations and 106 controller/store files. Counts include compatibility declarations and are not counts of unique supported business operations.

These are different levels of review: a parsed file is not automatically a behaviorally verified file. Binary images/fonts/audio are identified, not visually or acoustically reviewed. `node_modules`, generated `build`/`dist`/coverage, local `.env` values and ignored lockfiles are excluded from application review. No database, production API, provider, queue, login, migration or delivery operation was executed. No claim is made about deployed infrastructure controls or database contents. Dependency vulnerability assessment is outside this review.

Observed Git HEADs: frontend `06fcce9e67a6109bd796e8c5961cd91d84f228d0`, backend `cc851c713e533af4e321af9f7ca111539dcf9cc5`. These identify repository revisions, not immutable copies of the working trees.

Backend source and untracked backend documentation were already changing independently during review; no backend files were edited by this documentation task. Treat line references and route counts as a snapshot. Re-run the generator after changes:

```sh
node scripts/generate-sdd-inventory.cjs
# Optional alternative backend checkout, resolved relative to WanTrackApp:
node scripts/generate-sdd-inventory.cjs ../WanTrackApi
```

The generator overwrites only documents 07–09. It uses the frontend's installed `typescript` package and Git file lists, without importing application modules. Newly created source files must be tracked before they enter these generated indexes. Its route matches are candidates; manually verified contracts and mismatches are in documents 04 and 06.

Older files in `Documentation/` remain historical evidence. Their references to `backend/WanTrackApi`, route counts and pending refactors must be checked against current sibling source.
