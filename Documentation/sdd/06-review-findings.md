# Prioritized review findings

Static findings from the 2026-11-07 source snapshot. **No fixes are included in this documentation task.** P1 means high-impact behavior or security that should be addressed before relying on the affected flow; P2 means a material correctness/maintenance issue. These are source-level findings, not production exploit tests. Backend source was changing independently; recheck evidence before implementation.

## F01 — P1: chat history response is discarded

Evidence: [Chat.js](../../src/views/Chat.js), `loadChats`, accepts only `Array.isArray(chatResult.data)`. [chatsController.ts](../../../WanTrackApi/src/modules/support/chatsController.ts), `getChatsByPhone`, returns `{ messages, hasMore }` from [conversationStore.ts](../../../WanTrackApi/src/modules/support/conversationStore.ts).

A successful thread fetch becomes `[]`, so the UI appears empty even when messages exist. The frontend asks for 120 messages; the backend caps at 100 and supports `before`, but the UI has no older-page consumption. Align the envelope and add a focused contract test covering nonempty, empty and older-history responses.

## F02 — P1: user writes permit role escalation and trust the submitted company

Evidence: [authUserRoutes.ts](../../../WanTrackApi/src/routes/app/authUserRoutes.ts) protects `POST /api/user` with authentication only. [userController.ts](../../../WanTrackApi/src/modules/users/userController.ts), `createOrUpdate`, compares the caller's company with the **submitted** `info.idCompany`, then upserts by the submitted user ID and calls [rolController.ts](../../../WanTrackApi/src/modules/users/rolController.ts), `asign`, with the submitted `idRol`.

There is no platform-admin requirement for assigning role 1 or ownership check on the existing target row before an upsert. A non-admin can submit their own company and a privileged role for their own user; a subsequent login derives the new role from the database. Checking a claimed company does not authorize editing another existing user ID. Define role-management permissions, authorize the existing target before writes, and test a non-admin self-promotion and cross-company target update. The same-role restriction must not rely on hiding UI fields.

## F03 — P1: passwords are stored/compared directly and returned by user APIs

Evidence: [loginController.ts](../../../WanTrackApi/src/modules/users/loginController.ts) compares the submitted password directly in SQL. [userController.ts](../../../WanTrackApi/src/modules/users/userController.ts) writes the submitted password without hashing; `getAll` and `get` select `us.password` and return results. [UserProfile.js](../../src/views/UserProfile.js) edits this field.

This exposes password material through authenticated user reads and database access. Migrate to a password hashing/verification design, remove password fields from read responses, and separate password updates from profile edits. Include migration/reset handling rather than changing only the login comparison. Validate that no API, localStorage or log response contains password material.

## F04 — P1: several administrative REST operations lack auth

**Scope clarification (2026-11-07):** The backend owner explicitly confirmed events/guests and external-user/mission/profile APIs are intentionally public (`../WanTrackApi/AGENTS.md`). Their public access is not a defect to fix. The new Eventos menu uses module 26 only for browser visibility; it does not add API authorization. The unresolved findings for other administrative operations below remain.

Evidence: [events/index.ts](../../../WanTrackApi/src/events/index.ts) mounts Yoga directly; [events/schema.ts](../../../WanTrackApi/src/events/schema.ts) resolvers invoke the repository without user authorization. [reviewExternalRoutes.ts](../../../WanTrackApi/src/routes/review/reviewExternalRoutes.ts) exposes external users, missions, color profiles and summaries without auth. [documentRoutes.ts](../../../WanTrackApi/src/routes/app/documentRoutes.ts) exposes rule reads/writes without auth; [integrationRoutes.ts](../../../WanTrackApi/src/routes/app/integrationRoutes.ts) exposes Meta registration/subscription and executeFlow without auth.

At the application layer, unauthenticated requests can reach data changes or external effects. An upstream restriction may exist but was not established. Define which consumers are public, service-authenticated or user-authenticated, then enforce appropriate authorization and tenant ownership. Do not add browser sessions to provider webhooks indiscriminately; those need provider-specific verification. Verify denied requests before repository/provider execution.

## F05 — P1: Socket.IO broadcasts conversation data to unauthenticated clients

Evidence: [api.ts](../../../WanTrackApi/src/api.ts) creates Socket.IO with wildcard origin and no socket auth middleware. [conversationStore.ts](../../../WanTrackApi/src/modules/support/conversationStore.ts), `emitLive`, calls global `io.emit('conversation', payload)`; the payload includes peer/line and an inbox summary with contact/preview/assignment information. [socket.js](../../src/socket.js) connects without an auth payload.

HTTP tenant filtering does not protect a global socket broadcast. Authenticate socket connections and emit only to authorized company/user rooms; test that an unrelated company and unauthenticated client receive no conversation payload. Marker-only refresh events are lower sensitivity, but do not make the structured event safe.

## F06 — P1: record-level authorization is inconsistent beyond the newer chat paths

Evidence: [groupController.ts](../../../WanTrackApi/src/modules/conversations/groupController.ts) filters list queries for a company, but `get`, update and delete use IDs without the equivalent ownership predicate. [userController.ts](../../../WanTrackApi/src/modules/users/userController.ts), `getByEmail`, returns profile/module metadata for an arbitrary requested email without same-user/company checks. Similar identifier-based handlers appear throughout the controller catalog.

An authenticated caller can address records not offered in their list. Treat this as confirmed for the cited handlers, and an audit prompt—not an automatic verdict—for every other controller. Centralize resource ownership checks or SQL predicates per domain, and test paired accounts in different companies for read/write/export access.

## F07 — P1: untrusted document URLs are fetched by the server

Evidence: [documentsCheckController.ts](../../../WanTrackApi/src/controllers/documentsCheckController.ts), `analize`, passes `req.body.url` to Axios without host/IP restrictions or a request timeout/size policy in that call.

An authenticated caller can make the server fetch an arbitrary URL, including potentially internal services reachable by the deployment. Resolve uploads by authorized storage identifiers or restrict destinations and redirects with a defined download policy. Test invalid protocols, private destinations, redirects and oversized/slow responses without making real internal network calls.

## F08 — P1: HTML preview is unsanitized in the authenticated app origin

Evidence: [EmailTemplate.js](../../src/views/EmailTemplate.js) builds preview content from editable/loaded template HTML and renders it in an `iframe` with `srcDoc={emailContent}` and no `sandbox` attribute. The older `dangerouslySetInnerHTML` block is commented out; it is not the active implementation. No sanitizer was identified in the active path.

An unsandboxed srcDoc document inherits the parent origin and can run scripts with access to the parent application, where bearer tokens are held in localStorage. Use an appropriately sandboxed/sanitized email preview and test scripts, event attributes, links and parent access. Preserve legitimate email formatting when selecting the rendering policy.

## F09 — P2: conversation deletion calls no mounted API route

Evidence: [Conversations.js](../../src/views/Conversations.js) sends `DELETE /api/conversation/:id`; current mounted routes have no matching method/path. A separate group deletion operation exists in catalog routes.

The delete action receives no matching handler. Define whether this action deletes bot groups/messages/options and how dependent data is handled, then implement a coordinated contract. Do not alias it to live inbox conversations or a stored procedure based only on the word “conversation.” Validate success, absent ID, unauthorized ID and dependent-record behavior.

## F10 — P2: document verification and Save have mismatched semantics

Evidence: [DocumentCheck.js](../../src/views/DocumentCheck.js) loads a verificator object, posts it to `/api/document`, and navigates to campaign lists. That route uses checked-document `createOrUpdate`; [documentsCheckService.ts](../../../WanTrackApi/src/services/documentsCheckService.ts), `insertOrUpdate`, performs INSERT only. In `analize`, [documentsCheckController.ts](../../../WanTrackApi/src/controllers/documentsCheckController.ts) passes the Axios response object to `pdf(...)` rather than its data buffer and uses `forEach(async ...)` for rule writes before returning success.

Editing can create an unrelated checked-document row, PDF extraction receives the wrong input shape, and success can precede persistence of rule results. Separate verificator editing from document records, use the PDF buffer, await rule persistence, and define atomic failure behavior. Verify with a PDF fixture and a failed rule insert. The upload's company-ID segment also receives a verificator ID; resolve ownership explicitly.

## F11 — P2: automation UI executes a fixed campaign

Evidence: [Automatizations.js](../../src/views/Automatizations.js) uses a hardcoded list; [Automatization,.js](../../src/views/Automatization,.js) posts to `/api/executeFlow/117`.

A displayed/selected automation does not determine execution target. That route also lacks auth (F04). Define persistence, selection and execution contracts before treating this UI as a general automation builder. Validate that executing one selected automation never invokes another campaign ID.

## F12 — P2: database failures can become apparent success or empty data

Evidence: [manager.ts](../../../WanTrackApi/src/queries/manager.ts) catches DB errors and returns `undefined`/`0`. Several controllers/services respond without consistently checking these values. `documentsCheckService.insertOrUpdate` can return the input object after an unsuccessful result. User/role/department changes and bot-configuration saves span multiple independent operations.

A caller may see success/empty output after persistence failure, and related changes are not atomic. Establish explicit errors and transactions for each touched aggregate. Inject a failed SQL operation and verify rollback/error behavior; do not infer durability from a 200 response.

## F13 — P2: interpolated SQL remains in authenticated routes

Evidence: [groupController.ts](../../../WanTrackApi/src/modules/conversations/groupController.ts), `delete`, interpolates the raw path ID into `CALL delete_group (...)`, even though it calls `actionWithParameters`. [userController.ts](../../../WanTrackApi/src/modules/users/userController.ts), `hiddenUser`, interpolates the submitted user ID into SQL and targets `user/id`, inconsistent with the usual `users/iduser` table/column names.

Passing an empty parameter array does not parameterize interpolated SQL. Validate identifiers and use placeholders; confirm the actual schema for hiddenUser before correcting names. Test malformed IDs and verify no unintended query is formed. Exploitability depends on SQL grammar/driver configuration; no exploit was attempted.

## F14 — P2: token lifetime and URL transport need redesign

Evidence: [authenticate.ts](../../../WanTrackApi/src/security/authenticate.ts), `generateToken`, signs without expiry options. Admin validation and Excel exports include bearer tokens in URL paths; backend request logging is enabled.

Active-session validation/revocation exists, but does not prevent tokens appearing in access logs/history or define a time-bound session lifetime. Move token transport to headers or short-lived export grants and define refresh/expiry behavior with the UI. Verify revoked/old/expired sessions and ensure sensitive paths are not logged.

## F15 — P2: email worker can overlap batches and leaves failures unacknowledged

Evidence: [emailConsumer.ts](../../../WanTrackApi/src/workers/emailConsumer.ts) invokes async `processBatch()` without a running guard when size/timer triggers; it iterates a shared batch and resets it afterwards. Failed sends are logged without ack/nack handling. [rabbitManager.ts](../../../WanTrackApi/src/rabbit/rabbitManager.ts) does not set a consumer prefetch or publish persistence flag in this path.

Concurrent arrivals can trigger overlapping processing and duplicate sends; failed deliveries can remain unacknowledged until connection recovery. Define a single batch owner, explicit retry/dead-letter policy and durable publishing semantics. Test bursts, slow providers, failures and worker restarts with a local queue fixture.

## F16 — P2: embedded Meta signup stops before exchanging the authorization code

Evidence: [public/index.html](../../public/index.html), `launchWhatsAppSignup`, reads `response.authResponse.code` but only comments that it must be sent to the backend; it does not send it. [FacebookSignUp.js](../../src/views/FacebookSignUp.js) invokes this global function and renders the separate manual MetaFlow controls.

The signup popup alone cannot complete the server-side token exchange/provisioning flow. Define the backend exchange endpoint and account binding, then validate completion/cancellation/provider errors with a controlled app. The manual WABA subscribe/list/register controls are not evidence that the authorization-code exchange happens. The HTML also loads the provider SDK through two mechanisms; consolidate initialization when repairing onboarding.

## Additional review observations

- `Admin.getRoutes` mounts all admin entries regardless of sidebar modules. Add route-level UX denial as needed, but enforce security in the API.
- `localStorage` selection makes tabs and deep links fragile. Migrate selected entities to route parameters deliberately.
- `queries/whastAppTemplateController.ts` remains a full duplicate of the module implementation. Trace imports before consolidation.
- Webhook challenge verification exists; no POST signature verification was found in the inspected inbound path. Validate provider authenticity before invoking bot side effects.
- Incoming webhook processing addresses the first entry/change/message in several paths; batch/retry/idempotency behavior needs provider fixtures. Inbox message `wamid` uniqueness alone does not make all bot effects idempotent.
- `server.ts` allows 1024 MB JSON/urlencoded bodies and memory upload paths exist. Establish server-side size/time limits matching supported files.
- Frontend error handling can leave loaders active or render empty data; request interceptor rejection lacks a return. Add failure handling as each flow is repaired.
- Demo menus, a large bundle, missing tracked tests, ignored lockfiles and the incomplete SQL bootstrap limit maintainability/reproducibility. These are documented baseline gaps, not changes made by this review.
