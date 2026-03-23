# MiniHands Phase 2: All-in-One Local-First Architecture

Pivot from the current 3-process architecture (separate signaling server, separate Vite dev server, backend daemon) to a single executable that bundles everything: Express serves the compiled React UI, WebSocket signaling runs on the same server, and `cloudflared` punches through NAT.

---

## User Review Required

> [!IMPORTANT]
> **Signaling server retirement:** The standalone `signaling-server/` package will be obsoleted — its logic will be absorbed into the daemon. The directory will remain but can be deleted later.

> [!IMPORTANT]
> **Cloudflare tunnel dependency:** Task 2 requires `cloudflared` to be installed on the user's machine. The daemon will detect its absence and print install instructions. Do you want it to auto-install on Linux via [apt](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts#129-161)/`curl`, or should we keep it manual?

> [!WARNING]
> **`better-sqlite3` is a native C++ addon** — this contradicts the Phase 2 spec's goal of avoiding C++ binary dependencies. An alternative is `sql.js` (SQLite compiled to WASM, zero native deps). Which do you prefer?

> [!IMPORTANT]
> **Permission flow change:** Currently the Permission Interceptor uses CLI prompts (`@clack/prompts` confirm). Phase 2 moves this to the WebRTC channel so the user approves/denies from the web UI. The daemon will become fully headless after [start](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts#35-69).

---

## Proposed Changes

### Task 1: Local-First Architecture Pivot

Merge the signaling server and static file serving into the daemon. After this, `minihands start` boots one Express server on `:3000` that serves the compiled React UI, hosts a WebSocket endpoint for signaling, and starts the WebRTC peer connection.

#### [NEW] [server.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/server.ts)
- Create Express app on `localhost:3000`
- `app.use(express.static(path.join(__dirname, '../../web-ui/dist')))` — serve compiled React build
- Attach a `WebSocketServer` on the same HTTP server for signaling
- Port the room/PIN/SDP relay logic from [signaling-server/src/index.ts](file:///home/deepto/ML-2025/minihands/signaling-server/src/index.ts)
- Add SPA fallback: `app.get('*', (req, res) => res.sendFile('index.html'))` for React Router

#### [MODIFY] [webrtc.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts)
- Change `SIGNALING_SERVER_URL` default from `ws://localhost:8080` to `ws://localhost:3000`
- The daemon's WebRTC client connects to the same-process signaling server (loopback)

#### [MODIFY] [webrtc.ts (web-ui)](file:///home/deepto/ML-2025/minihands/web-ui/src/lib/webrtc.ts)
- Change default signaling URL from `ws://localhost:8080` to `ws://${window.location.host}` (same-origin)
- This makes it work whether accessed via `localhost:3000` or a Cloudflare tunnel URL

#### [MODIFY] [index.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts)
- Import and call `startServer(pin)` from `server.ts` before starting WebRTC

#### [MODIFY] [package.json](file:///home/deepto/ML-2025/minihands/backend/package.json)
- Add `express`, `@types/express` dependencies

---

### Task 2: Hybrid Tunneling (Cloudflare)

#### [NEW] [tunnelManager.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/tunnelManager.ts)
- `startEphemeralTunnel(port: number)` — spawns `cloudflared tunnel --url http://localhost:<port>`, parses stdout for the `*.trycloudflare.com` URL, returns it
- `startPersistentTunnel(tunnelId: string)` — spawns `cloudflared tunnel run <id>`
- `checkCloudflaredInstalled()` — runs `which cloudflared` and prints install instructions on failure
- Both functions return a cleanup handle to kill the child process on shutdown

#### [MODIFY] [index.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts)
- After Express boots, call `startEphemeralTunnel(3000)` and display the public URL + PIN in the terminal

---

### Task 3: SQLite Configuration & CLI UX

#### [NEW] [config.ts](file:///home/deepto/ML-2025/minihands/backend/src/db/config.ts)
- Initialize DB at `os.homedir() + '/.minihands/config.db'`
- Create table `config (key TEXT PRIMARY KEY, value TEXT)`
- Helper functions: `getConfig(key)`, `setConfig(key, value)`
- Stored keys: `openai_api_key`, `framerate`, `static_pin`, `tunnel_id`, `custom_domain`

#### [MODIFY] [index.ts (CLI)](file:///home/deepto/ML-2025/minihands/backend/src/index.ts)
- Replace single `init` command with three subcommands:
  - `minihands init` — wizard for API key + framerate, saves to SQLite
  - `minihands setup` — runs `cloudflared tunnel login`, binds domain, saves tunnel ID to SQLite
  - `minihands start` — daily driver: reads config from SQLite, boots Express, runs OS checks, starts tunnel, displays URL + PIN

#### [MODIFY] [cli/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/cli/index.ts)
- Refactor [runInitPrompt()](file:///home/deepto/ML-2025/minihands/backend/src/cli/index.ts#8-61) to save to SQLite instead of [.env](file:///home/deepto/ML-2025/minihands/backend/.env)
- Add `runSetupPrompt()` and `runStartSequence()` functions
- Remove `dotenv` import and [.env](file:///home/deepto/ML-2025/minihands/backend/.env) file writing

#### [MODIFY] [daemon/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts)
- Read `openai_api_key` from SQLite config instead of `process.env`
- Remove `dotenv.config()` call

#### [MODIFY] [package.json](file:///home/deepto/ML-2025/minihands/backend/package.json)
- Add `better-sqlite3` (or `sql.js`), `@types/better-sqlite3`
- Remove `dotenv`

---

### Task 4: AI Agent Execution Loop

#### [MODIFY] [daemon/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts)
- Replace single `generateText()` with a loop using `maxSteps` (Vercel AI SDK supports this natively via `maxSteps` parameter)
- Relay each tool call and result back over the `chat` channel for UI observability
- Relay permission requests over the `control` channel (not CLI `confirm`)

#### [MODIFY] [tools.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/tools.ts)
- Remove `@clack/prompts` confirm from `executeTerminal` — replace with an async permission flow that sends a request over WebRTC and awaits user response
- Create a `permissionBridge` module that holds pending approval promises, resolved by incoming control channel messages

#### [NEW] [permissionBridge.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/permissionBridge.ts)
- `requestPermission(command: string): Promise<boolean>` — sends `{type: 'permission_request', command}` over control channel, returns a Promise resolved when the UI sends back `{type: 'permission_response', approved: true/false}`
- Maintains a Map of pending requests keyed by ID

#### [MODIFY] [PermissionModal.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/components/PermissionModal.tsx)
- Wire to live data — listen on `control` channel for `permission_request` messages
- On Approve/Deny, send `permission_response` back over the channel
- Replace the currently hardcoded `rm -rf ./node_modules` with dynamic command text

#### [MODIFY] [Index.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx)
- Integrate [PermissionModal](file:///home/deepto/ML-2025/minihands/web-ui/src/components/PermissionModal.tsx#8-61) with live WebRTC state instead of the static `useState(true)`

---

### Task 5: Live Feed Remote Control

#### [MODIFY] [Index.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx) — [LiveScreen](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx#275-327) component
- Add `onMouseDown` / `onMouseUp` / `onMouseMove` / `onKeyDown` event listeners on the `<canvas>`
- Calculate relative X/Y: [(event.offsetX / canvas.clientWidth) * screenWidth](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Landing.tsx#22-52)
- Send JSON payloads: `{type: "click", x, y, button}`, `{type: "move", x, y}`, `{type: "keydown", key}`
- Throttle `onMouseMove` to ~16ms (≈60 FPS → capped at 15-20 effective sends via a `Date.now()` guard)

#### [MODIFY] [webrtc.ts (daemon)](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts)
- Add handlers in the `controlChannel.onMessage` subscriber for `move`, `click`, `keydown`, `keyup` message types
- Map to `@nut-tree-fork/nut-js` calls: `mouse.move(straightTo(...))`, `mouse.click(...)`, `keyboard.pressKey(...)`

---

### Task 6: Virtual Terminal (xterm.js)

#### [MODIFY] [package.json (web-ui)](file:///home/deepto/ML-2025/minihands/web-ui/package.json)
- Add `@xterm/xterm`, `@xterm/addon-fit`

#### [MODIFY] [Index.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx) — [TerminalPane](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx#328-348) component
- Replace the simple `<div>` log viewer with an `xterm.js` [Terminal](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx#83-86) instance
- On data from `terminal` WebRTC channel → `terminal.write(data)`
- On user keystroke in xterm → send back over `terminal` channel to daemon's stdin

#### [NEW] [shellManager.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/shellManager.ts)
- Use `child_process.spawn('bash')` (Linux/Mac) or `child_process.spawn('powershell.exe')` (Windows)
- Pipe `stdout` + `stderr` → [sendTerminal()](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts#29-34) over WebRTC
- Accept incoming data from the `terminal` channel → write to spawned process `stdin`
- **NO `node-pty`** — uses raw `child_process.spawn` with `{ shell: true }`

#### [MODIFY] [webrtc.ts (daemon)](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts)
- Wire `terminalChannel` `onMessage` to forward user input to the shell's stdin

---

### Task 7: Build & Packaging

#### [MODIFY] [package.json (backend)](file:///home/deepto/ML-2025/minihands/backend/package.json)
- Add `tsup` to devDependencies
- Add `"bin": { "minihands": "./dist/cli.js" }`
- Add build scripts:
  ```json
  "build:ui": "cd ../web-ui && npm run build",
  "build:backend": "tsup src/index.ts --format esm --target node18 --outDir dist",
  "build": "npm run build:ui && npm run build:backend && cp -r ../web-ui/dist ./web-ui-dist"
  ```

#### [MODIFY] [server.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/server.ts)
- Static path resolution: check for `../web-ui/dist` (dev) and `./web-ui-dist` (production) with fallback

#### [NEW] Root [package.json](file:///home/deepto/ML-2025/minihands/package.json) *(optional)*
- Monorepo convenience scripts if desired (e.g., `npm run build` from root)

---

## Verification Plan

### Automated Tests

There are no existing automated tests for the backend. The web-ui has a minimal [example.test.ts](file:///home/deepto/ML-2025/minihands/web-ui/src/test/example.test.ts) placeholder. Given the nature of this project (system-level daemon, WebRTC P2P, screen capture), automated unit tests are limited in value for the core flows.

**TypeScript compilation check** (confirms no import/type errors):
```bash
cd /home/deepto/ML-2025/minihands/backend && npx tsc --noEmit
```

**Web UI build check** (confirms React compiles cleanly):
```bash
cd /home/deepto/ML-2025/minihands/web-ui && npm run build
```

### Manual Verification

These are the key manual tests to validate after implementation. Each should be performed sequentially.

**1. Express + Static Serving:**
1. Run `cd /home/deepto/ML-2025/minihands/web-ui && npm run build` 
2. Run `cd /home/deepto/ML-2025/minihands/backend && npx tsx src/index.ts start`
3. Open `http://localhost:3000` in a browser — you should see the MiniHands Landing page
4. Navigate to `/pairing` — the Pairing page should load (SPA routing works)

**2. Integrated Signaling + WebRTC:**
1. With the daemon running from step 1, note the 6-digit PIN in the terminal
2. Open `http://localhost:3000/pairing` on a second browser tab/device
3. Enter the PIN and click Connect
4. The dashboard should show "Daemon Connected" status and the live screen feed should appear

**3. Cloudflare Tunnel:**
1. Ensure `cloudflared` is installed (`which cloudflared`)
2. Run `minihands start` — it should print a `*.trycloudflare.com` URL
3. Open that URL on your phone — the UI should load and pairing should work identically to localhost

**4. AI Agent Loop:**
1. On the dashboard, type a simple command like "list the files in my home directory"
2. You should see the agent's tool call and response streamed in the chat panel
3. Type a dangerous command like "delete the temp folder" — the PermissionModal should appear in the UI (NOT the CLI)

**5. Remote Control:**
1. After connecting, click on the live screen feed canvas
2. The mouse on the daemon machine should move to the corresponding location
3. Type on the canvas — keystrokes should be relayed to the daemon

**6. Virtual Terminal:**
1. Switch to the Terminal tab in the dashboard
2. You should see a shell prompt (bash or powershell)
3. Type `ls` and press Enter — output should appear in the xterm terminal
4. Interactive commands like [top](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx#101-104) should render correctly
