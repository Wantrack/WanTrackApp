# Configuration, validation and operations

## Frontend configuration

`src/util/constans.js` trims whitespace and a trailing slash. API URL precedence: `REACT_APP_API_URL`, otherwise development `http://localhost:80`, otherwise `https://wantrackapi.com`. Socket precedence: `REACT_APP_SOCKET_URL`, then `REACT_APP_API_URL`, then the same default. These are CRA build-time variables; changing an environment file after producing a bundle does not rewrite that bundle.

Example local settings (no credentials):

```dotenv
REACT_APP_API_URL=http://localhost:8081
REACT_APP_SOCKET_URL=http://localhost:8081
```

Match the actual backend listener and proxy topology. BrowserRouter hosting needs a fallback to the SPA HTML for `/admin/*` and `/login/*`; the repository does not establish the deployed host's rewrite configuration.

Frontend commands from its repository root:

```sh
npm start
npm run build
npm test -- --watchAll=false
node scripts/generate-sdd-inventory.cjs
```

`npm test` is declared but no application test files were found in the tracked baseline. Do not report an empty test run as behavioral coverage. `compile-scss`/`minify-scss` generate CSS from the dashboard SCSS entry. `deploy` invokes `vercel --prod`; do not run it for a review. `install:clean` deletes dependency state and starts the app; it is not a routine verification command.

## Backend configuration

Backend config comes from `src/config/config.json` plus selected environment overrides. Only key names were inspected for sensitive configuration; no secret values belong in these documents or AI prompts.

| Area | Variables / configuration | Important behavior |
|---|---|---|
| HTTP | `LOCAL_PORT`, `PORT`, `server.port` | Precedence in that order |
| MySQL | `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_PORT`, `MYSQL_CONNECTION_LIMIT` | Environment overrides JSON; port defaults to 3306 |
| JWT | `server.jwtSign` in config JSON | No JWT secret environment override found in authentication source |
| General AI | `tokenchatgpt`, config `chatgpt.token` | Legacy helper credential source |
| Document AI | `OPENAI_API_KEY` | Separate credential name used in document analysis |
| AWS | `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME` | Selected fallback values from JSON; provider behavior varies by module |
| Bucket aliases | `IMAGES_WS_BUCKET`, `AUDIO_EMOTIONS_BUCKET`, `DOCUMENTS_CHECK_BUCKET` | Map historical bucket labels |
| Campaign/template media | `SCATTER_LIST_IMAGES_BUCKET`, `AWS_SCATTER_LIST_IMAGES_BUCKET`, `TEMPLATE_MEDIA_BUCKET`, `AWS_TEMPLATE_MEDIA_BUCKET` | Upload controller fallback chains |
| Meta | `META_GRAPH_BASE`, `META_API_VERSION`, `META_ACCESS_TOKEN`, `META_APP_ID`, `META_WABA_ID` | Newer Meta client/service config; legacy communication modules also have fixed versions/settings |
| Webhooks | `verifyToken`, `WEBHOOK_FORWARD_URL` | Challenge verification and optional forwarding |
| SQS | `ENABLE_WHATSAPP_STATUS_SQS`, `QUEUE_URL` | Polling opt-in; starts a once-per-second cron with an overlap guard |
| RabbitMQ | `RABBITMQ_URL` | API initiates connection on boot, defaulting to local guest URI; worker reads env directly |
| Email worker | `EMAIL_QUEUE_NAME`, `EMAIL_BATCH_SIZE`, `EMAIL_BATCH_TIMEOUT_MS`, `SES_EMAIL_SOURCE` | Separate consumer module and SES sender |
| Runtime | `NODE_ENV` | Influences GraphiQL, masking and error behavior |

Set required service credentials locally through the project's approved configuration process. Environment variable names here document current code, not a promise that all providers are consistently configured. Never put provider secrets in `REACT_APP_*`, public assets or browser source.

Backend commands, run from `../WanTrackApi`:

```sh
# Compile-only, no server startup and no dist output:
./node_modules/.bin/tsc --noEmit --incremental false
# Normal build:
npm run build
# Example local server command, only with a controlled service/database setup:
LOCAL_PORT=8081 npm run start-dev
```

`dev:mac` builds, watches TypeScript and watches `dist/api.js`. `dev` uses `nodemon`, which is not declared in the inspected package manifest. `start-dev:8081` uses Windows `set` syntax and should not be assumed to work on macOS. `npm start` runs `node api.js`, matching the deployed `dist` package root, not the source repository root. The email worker can be run from its compiled module, but will consume/send real queued mail; it was not started in this review.

## Schema and deployment

Migrations cover WhatsApp business-scoped IDs, API-token storage, normalized inbox, events/guests and an RDS inbox deployment script. They are not a complete schema history and were not applied. Obtain a sanitized schema/migration baseline before attempting a clean environment or destructive migration. Do not assume runtime column-creation code in template handling replaces controlled migrations.

The observed API workflow builds on a push to `main` using Node 22, copies package/runtime/proxy files into `dist`, zips that directory and deploys to Elastic Beanstalk using AWS OIDC credentials. `wait_for_deployment` is false, so workflow submission is not proof of a healthy completed deployment. Frontend manifest has a Vercel production command but no equivalent tracked deployment workflow was found.

Both repositories had local lockfiles, but the baseline Git file lists did not include them. This limits dependency reproducibility. Do not silently reinstall/update dependencies during a documentation task; record the actual installation used for checks.

## Validation performed on 2026-11-07

| Check | Result | Meaning |
|---|---|---|
| Frontend `npm run build` | Passed: “Compiled successfully” | Existing installed dependencies can compile this snapshot; no runtime flow validation |
| Frontend build observations | Main JS about 595.72 kB gzip; large-bundle warning; stale Browserslist data; unsupported `.npmrc` keys warned | Baseline maintenance/performance observations, not a failed build |
| Backend `tsc --noEmit --incremental false` | Failed with five TS2307 diagnostics | Installed modules could not resolve `graphql` / `graphql-yoga` in events index, repository, schema and sort; these dependencies are declared in package.json |
| Static inventories | Generator parses frontend JS/JSX and backend TypeScript without application execution | No parse diagnostics; route matching is heuristic |
| Automated behavioral tests | Not run; no tracked application tests identified | No claim of feature/regression coverage |
| Live integration, database and provider checks | Not run | No DB changes, migrations, messages, tokens, mail, uploads or deployments were performed |

Backend files were changing independently during the review. Revalidate after that work and dependency synchronization finish; the recorded failure describes the installation at check time, not an inherent TypeScript defect in the GraphQL design.

## Focused validation for future changes

Use fixture/stubbed contracts first: login string response and invalidated sessions; tenant isolation and role restrictions; list envelopes and search resets; chat `{messages, hasMore}` including empty/older pages; phone and BSUID peers; human assignment and bot resumption; template parameter/media validation; partial saves; campaign send failures; malformed PDF/OCR/AI responses. Use controlled test accounts for provider checks and avoid treating an HTTP 200 as proof of delivery or durable persistence.
