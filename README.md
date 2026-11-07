# WanTrackApp

WanTrackApp is the React frontend for WanTrack. Its backend is the separate sibling repository **`../WanTrackApi`**, normally under the same parent folder. The tracked `backend/WanTrackApi` entry is empty in this checkout.

Start with the [Software Design Documents](Documentation/sdd/README.md) for architecture, folders/screens, API relationships, configuration and the detailed review findings.

AI project instructions: [AGENTS.md](AGENTS.md) · [CLAUDE.md](CLAUDE.md) · [CHATGPT.md](CHATGPT.md).

```sh
npm start
npm run build
# Regenerate static file, request/route and controller indexes:
node scripts/generate-sdd-inventory.cjs
```

Set `REACT_APP_API_URL` and, if needed, `REACT_APP_SOCKET_URL` to the intended backend before starting/building. See [operations and validation](Documentation/sdd/05-operations.md) for setup limitations and the review's actual check results.
