# MiniHands Phase 2: All-in-One Local-First Architecture

Pivot from the current 3-process architecture (separate signaling server, separate Vite dev server, backend daemon) to a single executable that bundles everything: Express serves the compiled React UI, WebSocket signaling runs on the same server, and `cloudflared` punches through NAT.

---

## Proposed Changes

### Task 1: Local-First Architecture Pivot

Merge the signaling server and static file serving into the daemon. After this, `minihands start` boots one Express server on `:3000` that serves the compiled React UI, hosts a WebSocket endpoint for signaling, and starts the WebRTC peer connection.

#### [NEW] [server.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/server.ts)
- Express app on `localhost:3000`
- `app.use(express.static(...))` to serve compiled React build from `../web-ui/dist` (dev) or `./web-ui-dist` (prod)
- WebSocketServer on the same HTTP server for signaling
- Port the room/PIN/SDP relay logic from [signaling-server/src/index.ts](file:///home/deepto/ML-2025/minihands/signaling-server/src/index.ts)
- SPA fallback: `app.get('*', ...) => res.sendFile('index.html')`

#### [MODIFY] [webrtc.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts)
- Default signaling URL → `ws://localhost:3000`

#### [MODIFY] [webrtc.ts (web-ui)](file:///home/deepto/ML-2025/minihands/web-ui/src/lib/webrtc.ts)
- Default signaling URL → `ws://${window.location.host}` (same-origin, works for localhost and tunnel URLs)

#### [MODIFY] [daemon/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts)
- Import and call `startServer(pin)` before starting WebRTC

#### [MODIFY] [package.json](file:///home/deepto/ML-2025/minihands/backend/package.json)
- Add `express`, `@types/express`

---

### Task 2: Hybrid Tunneling (Cloudflare)

#### [NEW] [tunnelManager.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/tunnelManager.ts)
- `checkCloudflaredInstalled()` — runs `which cloudflared`, if missing:
  - Detect OS via `os.platform()`
  - **macOS:** prompt user, then run `brew install cloudflare/cloudflare/cloudflared`
  - **Linux:** prompt user, then `curl -L` download the binary to `/usr/local/bin/`
  - **Windows:** print manual instructions
  - Always uses `@clack/prompts` confirm before downloading
- `startEphemeralTunnel(port)` — spawns `cloudflared tunnel --url http://localhost:<port>`, parses stdout for `*.trycloudflare.com` URL
- `startPersistentTunnel(tunnelId)` — spawns `cloudflared tunnel run <id>`
- Returns cleanup handle to kill child process on shutdown

#### [MODIFY] [daemon/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts)
- After Express boots, call tunnel manager and display public URL + PIN

---

### Task 3: SQLite Configuration & CLI UX

> [!NOTE]
> Using **`best-sqlite3`** — a WASM-based SQLite driver for Node.js with zero native bindings and true disk persistence.

#### [NEW] [config.ts](file:///home/deepto/ML-2025/minihands/backend/src/db/config.ts)
- Initialize DB at `os.homedir() + '/.minihands/config.db'`
- Table: `config (key TEXT PRIMARY KEY, value TEXT)`
- Helpers: `getConfig(key)`, `setConfig(key, value)`
- Keys: `openai_api_key`, `framerate`, `static_pin`, `tunnel_id`, `custom_domain`

#### [MODIFY] [index.ts (CLI)](file:///home/deepto/ML-2025/minihands/backend/src/index.ts)
- Three subcommands via `commander`:
  - `minihands init` — wizard for API key + framerate → saves to SQLite
  - `minihands setup` — runs `cloudflared tunnel login`, binds domain → saves tunnel ID to SQLite
  - `minihands start` — reads config from SQLite, boots Express, OS checks, starts tunnel, displays URL+PIN

#### [MODIFY] [cli/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/cli/index.ts)
- Refactor `runInitPrompt()` to save to SQLite instead of `.env`
- Add `runSetupPrompt()` and `runStartSequence()`
- Remove `dotenv` usage

#### [MODIFY] [daemon/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts)
- Read `openai_api_key` from SQLite config instead of `process.env`
- Remove `dotenv.config()` call

#### [MODIFY] [package.json](file:///home/deepto/ML-2025/minihands/backend/package.json)
- Add `best-sqlite3`, remove `dotenv`

---

### Task 4: AI Agent Execution Loop

> [!IMPORTANT]
> Uses `maxSteps` (capped at 10) with the SDK's natural stop: the loop terminates when the LLM returns a text response with no tool calls. System prompt explicitly instructs: *"When a tool is denied, explain what happened and do NOT retry."*

#### [MODIFY] [daemon/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts)
- Add `maxSteps: 10` to `generateText()` call
- Stream each step's tool calls + results over the `chat` channel for UI observability
- Add system instruction to prevent infinite retry loops

#### [NEW] [permissionBridge.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/permissionBridge.ts)
- `requestPermission(command): Promise<boolean>` — sends `{type: 'permission_request', id, command}` over control channel
- Awaits resolution from incoming `{type: 'permission_response', id, approved}` messages
- Maintains a `Map<string, {resolve}>` of pending requests

#### [MODIFY] [tools.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/tools.ts)
- Replace `@clack/prompts` confirm in `executeTerminal` with `requestPermission()` from the bridge
- Remove CLI prompt imports

#### [MODIFY] [PermissionModal.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/components/PermissionModal.tsx)
- Wire to live `control` channel data — listen for `permission_request`, send `permission_response`
- Replace hardcoded `rm -rf ./node_modules` with dynamic command text

#### [MODIFY] [Index.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx)
- Integrate `PermissionModal` with live WebRTC state

---

### Task 5: Live Feed Remote Control

#### [MODIFY] [Index.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx) — `LiveScreen`
- `onMouseDown`, `onMouseUp`, `onMouseMove`, `onKeyDown` on `<canvas>`
- Relative coords: `(offsetX / clientWidth) * screenWidth`
- JSON payloads: `{type:"click",x,y,button}`, `{type:"move",x,y}`, `{type:"keydown",key}`
- Throttle `onMouseMove` to ~50ms intervals

#### [MODIFY] [webrtc.ts (daemon)](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts)
- Handle `move`, `click`, `keydown` messages → map to `@nut-tree-fork/nut-js` calls

---

### Task 6: Virtual Terminal (xterm.js)

#### [NEW] [shellManager.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/shellManager.ts)
- `child_process.spawn('bash')` (Linux/Mac) or `spawn('powershell.exe')` (Windows) — **NO `node-pty`**
- Pipe `stdout`/`stderr` → `sendTerminal()` over WebRTC
- Accept data from `terminal` channel → write to process `stdin`

#### [MODIFY] [webrtc.ts (daemon)](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts)
- Wire `terminalChannel.onMessage` to shell stdin

#### [MODIFY] [Index.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx) — `TerminalPane`
- Replace `<div>` log viewer with `xterm.js` Terminal instance
- Incoming terminal data → `terminal.write(data)`
- User keystrokes → send back over terminal channel

#### [MODIFY] [package.json (web-ui)](file:///home/deepto/ML-2025/minihands/web-ui/package.json)
- Add `@xterm/xterm`, `@xterm/addon-fit`

---

### Task 7: Build & Packaging

#### [MODIFY] [package.json (backend)](file:///home/deepto/ML-2025/minihands/backend/package.json)
- Add `tsup` to devDependencies
- `"bin": { "minihands": "./dist/cli.js" }`
- Build scripts: `build:ui` (vite build) → `build:backend` (tsup) → copy dist

#### [MODIFY] [server.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/server.ts)
- Static path: check for `../web-ui/dist` (dev) and `./web-ui-dist` (prod)

---

## Verification Plan

### Automated
```bash
cd /home/deepto/ML-2025/minihands/backend && npx tsc --noEmit
cd /home/deepto/ML-2025/minihands/web-ui && npm run build
```

### Manual (sequential)
1. **Static serving:** Build web-ui, `minihands start`, open `localhost:3000` → Landing page loads, `/pairing` SPA route works
2. **Signaling + WebRTC:** Enter PIN on pairing page → dashboard shows "Daemon Connected" + live screen feed
3. **Cloudflare tunnel:** `minihands start` prints `*.trycloudflare.com` URL → works from phone
4. **AI loop:** Send "list files in home dir" → agent streams tool call + response; send dangerous command → PermissionModal appears in **web UI** (not CLI)
5. **Remote control:** Click on canvas → mouse moves on daemon; type on canvas → keystrokes relay
6. **Virtual terminal:** Terminal tab shows bash prompt; `ls` + Enter returns output; interactive commands work
