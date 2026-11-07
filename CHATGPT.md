# ChatGPT project context — WanTrackApp

This file is a portable context entry point for a ChatGPT conversation; it does not assume ChatGPT can read local files automatically. Provide this file, [AGENTS.md](AGENTS.md), and the relevant SDD/source files when working outside a repository-connected environment.

**WanTrackApp is the frontend; the sibling `../WanTrackApi` is the backend.** They are separate Git repositories, usually under the same parent folder. Do not mistake the frontend's empty `backend/WanTrackApi` gitlink for the active API checkout.

Start with [the SDD index](Documentation/sdd/README.md). Use [system design](Documentation/sdd/01-system-design.md), [frontend design](Documentation/sdd/02-frontend-design.md), [backend design](Documentation/sdd/03-backend-design.md) and [contracts](Documentation/sdd/04-contracts-and-flows.md) for architecture questions. Use [findings](Documentation/sdd/06-review-findings.md) for known defects and [request mapping](Documentation/sdd/08-api-relationship.md) for cross-repository work.

When proposing or making a change, identify the exact frontend consumer and backend contract, distinguish current behavior from the intended fix, preserve tenant/role and WhatsApp identity boundaries, and specify meaningful verification. Ask about unresolved product semantics; do not guess that similarly named entities are interchangeable. Do not claim files were inspected or checks passed if they were not available in the conversation.

Documentation snapshot: 2026-11-07. Source takes precedence when it has changed. The review found critical chat-response and authorization problems; it documented them without changing application code.
