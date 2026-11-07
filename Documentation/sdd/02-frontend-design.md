# Frontend design

## Folder ownership

| Path | Responsibility and review guidance |
|---|---|
| `src/index.js`, `src/routes.js` | Application entry and route/menu metadata. Route changes must be checked with layout and sidebar visibility. |
| `src/layouts/Admin/`, `src/layouts/RTL/` | Admin shell/session startup and login shell; RTL naming comes from the template. |
| `src/components/Auth/` | Login, token storage and profile lookup. |
| `src/components/Navbars/`, `Sidebar/`, `Footer/` | Navigation, notification refresh, logout/display behavior and shell UI. |
| `src/components/Pagination/` | Server pagination hook plus reusable controls/client pagination. |
| `src/components/Loader/`, `src/ui/` | Loading indicator and general modal. |
| `ThemeWrapper/`, `BackgroundColorWrapper/`, `src/contexts/` | Theme/background UI state; not authentication or domain stores. |
| `src/components/FixedPlugin/` | Template appearance controls; not mounted by active Admin shell. |
| `src/config/`, `src/socket.js` | Bearer Axios interceptor and per-instance Socket.IO connections. |
| `src/views/` | Product lists, editors, reports, live chat and remaining demos. |
| `src/util/` | Base64 profile encoding, base URLs, stored profile access, Excel/PDF extraction, email HTML, sentiment/emotion colors and time display. |
| `src/variables/` | Chart configurations and sample chart data; do not confuse sample datasets with API output. |
| `src/assets/scss/` | Main dashboard styling and custom/component/vendor partials. `src/index.js` imports the SCSS entry. |
| `src/assets/css/`, `demo/`, `fonts/`, `img/` | Generated/prebuilt styles, demo styles, icon fonts and images. Prefer editing SCSS source for dashboard styling. |
| `public/` | HTML shell with inline Meta signup/bootstrap, manifest, logos/backgrounds and bundled Meta SDK. Public files ship to the browser; the manifest retains CRA sample names. |
| `Documentation/` | Historical audits plus the current `sdd/` set. |
| `backend/WanTrackApi` | Empty Git submodule-style entry, not the active API checkout. |
| Root metadata | `package.json`, `.npmrc`, `.gitignore`, `jsconfig.json`, README, template changelog/license/issue template. |

All individual files and JavaScript imports/functions/storage keys appear in [07](07-file-inventory.md). Binary assets are inventoried without visual inspection. The third-party SDK is not treated as application-authored code.

## Screen map

All paths below are beneath `/admin` unless specified. A route's presence does not guarantee a finished workflow.

| View file(s) | Route(s) / use | Backend domain and behavior |
|---|---|---|
| `Events.js`, `Event.js` | `/events`, `/event?id=…` | GraphQL event list/create/edit and nested guest invitations; module 26. |
| `Dashboard.js` | `/dashboard` | Message sent/received/delivered/read/failed charts and campaign report. Dynamic `buildDashboardUrl` builds report requests. |
| `DashboardConversation.js` | `/dashboardconversations` | Company/adviser call and conversation metrics, emotions, duration, NPS and satisfaction. |
| `Companies.js`, `Company.js` | `/companies`, `/company`; `/emailcampaing` reuses Companies | Company CRUD, departments, WhatsApp account links and API token creation/revocation. Email campaign menu is not a dedicated campaign editor. |
| `Users.js`, `UserProfile.js` | `/users`, `/user` | User details, company, role and department memberships. API currently exposes password fields; see review. |
| `Conversations.js`, `Conversation.js` | `/conversations`, `/conversation` | Bot definition groups, messages and options/flow links. Group save spans several requests. Delete URL is unmatched. |
| `Templates.js`, `Template.js` | `/steps`, `/step` | Internal bot step templates, headers, buttons and action settings; not Meta templates. |
| `WsTemplates.js`, `WsTemplate.js` | `/wstemplates`, `/wstemplate` | Meta template creation, media/examples, parameter validation and status refresh. Hidden SMS entry reuses `/wstemplates`. |
| `ScatterLists.js`, `ScatterList.js` | `/lists`, `/list` | WhatsApp campaign definitions, contact import, selection, media/template parameters, copying, send and Excel export. |
| `Chats.js`, `Chat.js` | `/chatsws`, `/chat` | Inbox search/pagination, active assignment release, thread, text/media/audio, AI suggestion and human-attention toggle. Thread response mismatch is a release blocker. |
| `Advisors.js`, `Advisor.js` | `/advisors`, `/advisor` | Adviser configuration and analytics. Lead Automatization and Asesores Lead menu entries reuse `/advisors`. |
| `Calls.js` | `/calls` | Transcription/analysis uploads, adviser selection, call/chat analysis results. |
| `LeadsCenter.js`, `LeadViewer.js` | `/leadsCenter`, `/leadviewer` | Campaign lead lists and JSON answer expansion into a table. |
| `WhatsAppAccount.js` | `/whatsappaccount` | WhatsApp account settings, training documents and Meta setup integration. |
| `FacebookSignUp.js` | `/fbsignup` | Embedded signup/script UI; authorization code is read but not sent to backend (F16). |
| `MetaFlow.js` | Nested component, not direct route | Subscribe WABA, list phone numbers and register line via `/api/meta/*`. |
| `WebHooks.js`, `WebHookMessage.js` | `/webhooks`, `/webhook` | Configured webhook messages, payloads, template mapping and rules. |
| `EmailTemplates.js`, `EmailTemplate.js` | `/emailtemplates`, `/emailtemplate` | HTML/text templates and AI improvement. |
| `DocumentsCheck.js`, `DocumentCheck.js` | `/documentsCheck`, `/documentCheck` | Verificator list, rules, file upload/analysis and result display. Editor mixes verificator and document save concerns. |
| `Automatizations.js`, `Automatization,.js` | `/automatizations`, `/automatization` | Hardcoded sample automation and ReactFlow graph; execution targets hardcoded campaign 117. The comma in filename is real. |
| `Summary.js`, `HistoryTrans.js` | `/summary`; nested history | Monthly usage counts and sent-message history. |
| `Feelings.js` | `/feelings` | Sentiment test bench with audio upload and AI analysis; includes hardcoded company upload ID. |
| `Notifications.js`, `TableList.js`, `Typography.js` | No direct route in `src/routes.js` | Remaining template/demo views; do not infer shipped product features from their existence. |

## State and identity

Form state is mostly component-local hooks, sometimes accompanied by mutable module-level objects. Detail navigation writes an ID to localStorage and opens a fixed path, instead of encoding the entity in the URL. Examples: `currentCompanyID`, `currentGroupID`, `currentTemplateID`, `currentWsTemplateID`, `currentScatterListID`, `currentAdvisorID`, `currentVerificatorID`, `currentWhatsAppAccountID`, and `currentleadID`. Chat uses `currentPhone`, `currentphoneNumberID`, `currentName`.

This means deep links, concurrent tabs and stale localStorage can select the wrong entity. Email and WhatsApp template screens reuse `currentWsTemplateID`. Profile metadata is Base64-encoded JSON, not encrypted or authoritative. `localStorageInfo.js` decodes without a parse guard; Admin's separate parser is guarded.

The Admin landing path prioritizes document-only module 21, then module 11 conversation dashboard, module 1 dashboard, module 15 chat, then module 26 events, otherwise access-denied. Menu separators and entries use `idText`/`idSep`; the chat entry has an inconsistent assignment. Repeated paths in the menu are intentional aliases or unfinished reuse, not independent screens.

## Data and error handling

`useServerPagination` requests `{ page, pageSize }`, accepts either a bare array or `{ data, total }`, and guards late updates after effect cleanup. Search and refresh dependencies reset the current page. Failures become an empty list without an exposed error state. `TablePagination.js` also supplies client-side slicing for lists fetched in full. Do not paginate the same dataset twice.

The Axios request interceptor adds `Authorization: Bearer …`; it has no centralized response interceptor to clear sessions on 401, and its error callback fails to return `Promise.reject`. Screens have inconsistent error/loading handling. New work should establish explicit idle/loading/success/error states for the touched flow without silently rewriting unrelated screens.

Socket connections are created per `SocketService`. Chat listens for `chatrefresh`; inbox and navbar use `notificationrefresh`. Components disconnect during cleanup. The backend also emits `conversation`, but the current frontend does not subscribe to that richer event.

## Maintainability observations

Large files combine transport, domain mapping and rendering: `ScatterList.js`, `WsTemplate.js`, `Template.js`, `Advisor.js`, `DashboardConversation.js` and `Calls.js`. Extract a small API adapter or domain helper when changing a flow, then test its actual contract. Do not perform an architecture rewrite simply to make a documentation review look complete.

## Events frontend (2026-11-07)

`services/eventsApi.js` adapts `/events/graphql`, rejects GraphQL errors even with HTTP 200, and preserves `{ items, total, page, pageSize }`. `Events.js` lists server pages; `Event.js` uses a URL query ID to avoid cross-tab localStorage selection. Creating an event replaces the URL with its saved ID before enabling `EventGuests`. Forms retain values on failures and disable submissions while saving. Loads ignore stale responses.

The Eventos menu entry appears last and uses `idText: '26'`, as requested by the owner. Leads Center retains module 24. Module 26 is a fallback landing page after the existing dashboard/chat choices. Menu visibility is UI state, not backend authorization; events remain intentionally public per the backend owner's documented decision.

Event fields include type (selected from the existing catalog), venue, date/times, location/coordinates, dress codes, invitation link and bot metadata. Existing arbitrary `timeline` JSON is preserved by omission from updates; this screen does not edit it. Bot metadata does not activate a messaging integration. Invitations support create/edit, name search, confirmation filtering and server pagination. Each request carries the current event ID. A status is sent on edit only if changed, preserving the backend's existing confirmation timestamp otherwise. Date/time strings are passed without timezone conversion. The event editor lets the operator choose a company, account and approved template. Guardar evento persists the selection for the event and company after saving the event fields. If only the selection save fails, the editor retains the draft and retries against the saved event ID. Enviar invitaciones uses the saved selection and opens the confirmation dialog. Both template parameters use the saved guest name. The URL parameter is encoded in UTF-8 Base64.

Events and invitation selectors use native `select.form-control`, matching the existing dashboard styles. Type creation is not offered in the event editor.

Guest creation/editing requires a nonblank name and a digits-only international phone including its country calling code. `libphonenumber-js/max` validates the explicitly international value without a default country; the original digit string is sent unchanged. The form displays Spanish validation errors (both required messages when both fields are empty) and keeps entered values without calling the API on failure. Existing guests without a valid phone must correct it before saving from this UI.
