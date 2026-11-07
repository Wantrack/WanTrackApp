# Claude project context — WanTrackApp

Read and follow [AGENTS.md](AGENTS.md) as the shared project instruction source. Read [Documentation/sdd/README.md](Documentation/sdd/README.md) for the software design and [the review findings](Documentation/sdd/06-review-findings.md) before changing an affected flow.

WanTrackApp is the React frontend. **`../WanTrackApi` is its separate backend**, normally in the same parent directory. The local `backend/WanTrackApi` entry is an empty gitlink in this checkout. For integration work, inspect both real repositories; do not infer backend behavior from old documentation or frontend assumptions.

For a focused task, read the relevant view, shared transport helper, mounted backend route and controller/service before editing. [The API relationship](Documentation/sdd/08-api-relationship.md) and [controller index](Documentation/sdd/09-controller-index.md) locate them. Preserve unrelated work, keep credentials out of outputs, and report verification limits. A build cannot prove tenant isolation, external delivery or database persistence.

Use the shared instructions and SDD as the canonical project context; do not maintain a divergent Claude-only architecture description.
