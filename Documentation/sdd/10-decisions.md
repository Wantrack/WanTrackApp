# Decisions and future change checklist

## Decisions established for this documentation

| Decision | Reason / consequence |
|---|---|
| SDD means Software Design Documents plus AI instructions | Confirmed by the user; this is not a new spec-driven framework or application rewrite. |
| WanTrackApp is frontend; sibling WanTrackApi is backend | Confirmed by the user and repository inspection. The empty frontend gitlink is not the active backend source. |
| One shared SDD and shared AGENTS instructions | ChatGPT/Codex and Claude should not receive contradictory architecture copies. CHATGPT.md is portable context; CLAUDE.md points to shared instructions. |
| Documentation-only changes in frontend repository | Preserve independent backend source/documentation work and separate findings from fixes. |
| Describe actual architecture before recommendations | Mixed backend layers, mounted review routes, placeholder screens and API mismatches are real, not a clean architecture to invent. |
| Generated indexes supplement human review | Structural inventories support coverage and navigation but cannot validate authorization, payloads or business semantics. |

These decisions do not impose new product policies, SLAs or deployment approvals.

## Open product/design decisions

These did not prevent documentation, but should be answered when implementing the affected feature:

- What must deleting a chatbot definition remove or preserve: group, steps/options, captured responses, audit history and active bot state?
- Which roles may create users, assign roles/departments, edit other users, manage API tokens or administer multiple companies?
- Which external REST and events GraphQL consumers are intended to be public, company-token authenticated, user authenticated or service authenticated?
- Should document Save edit the verificator, create a checked-document record, or both? What is the intended ownership rule for uploaded files and verificator results?
- Is the hardcoded automation UI a retained demonstration or a product feature requiring persisted graphs and selected-target execution?
- What are the supported browser/runtime versions, delivery/retry guarantees, retention policies and operational service objectives? They are not established by the source.
- Where is the complete sanitized database bootstrap and which migrations are already applied in each environment?

## Change impact checklist

For each future request, record only the relevant items:

1. User-visible behavior and the exact view/route; whether the flow is currently functional or a placeholder.
2. HTTP/socket contract: method/path, query/body, response/error shape, pagination and backwards compatibility.
3. Backend owner: mounted route, actual controller implementation, services/queries and tables/provider calls. Follow shims to their owner.
4. Authorization: caller identity, role/capability, company ownership, selected-record ownership and applicable chat assignment constraints.
5. Persistence: identity/casing, migrations, transactions, retries, duplicate requests and partial failures.
6. UI behavior: loading/error/empty states, stale selection, tab/deep-link behavior, socket cleanup and permission-denied UX.
7. Verification: focused regression/contract checks and controlled integration coverage; distinguish static/build results from actual provider or database tests.
8. Documentation: update the affected SDD and regenerate 07–09 after tracked source changes. Record known limitations rather than marking untested behavior complete.

Do not turn this checklist into unnecessary ceremony for small edits. Apply the parts that protect the actual behavior being changed.
