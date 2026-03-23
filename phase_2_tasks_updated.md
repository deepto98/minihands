# MiniHands Phase 2 Implementation

## Task 1: Local-First Architecture Pivot
- [ ] Add `express` + `@types/express` to [backend/package.json](file:///home/deepto/ML-2025/minihands/backend/package.json)
- [ ] Create `backend/src/daemon/server.ts` — Express server on `:3000` serving static React build + WS signaling
- [ ] Move signaling logic from [signaling-server/src/index.ts](file:///home/deepto/ML-2025/minihands/signaling-server/src/index.ts) into `server.ts`
- [ ] Update [backend/src/daemon/webrtc.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts) — default signaling to `ws://localhost:3000`
- [ ] Update [web-ui/src/lib/webrtc.ts](file:///home/deepto/ML-2025/minihands/web-ui/src/lib/webrtc.ts) — default signaling URL to `ws://${window.location.host}`
- [ ] Wire `startServer(pin)` call into daemon boot in [daemon/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts)

## Task 2: Hybrid Tunneling (Cloudflare)
- [ ] Create `backend/src/daemon/tunnelManager.ts` — ephemeral + persistent modes
- [ ] Add `checkCloudflaredInstalled()` with OS-aware auto-install (brew on Mac, curl on Linux), always prompts user first
- [ ] Integrate tunnel startup into daemon boot sequence

## Task 3: SQLite Configuration & CLI UX
- [ ] Add `best-sqlite3` to [backend/package.json](file:///home/deepto/ML-2025/minihands/backend/package.json), remove `dotenv`
- [ ] Create `backend/src/db/config.ts` — SQLite DB at `~/.minihands/config.db`
- [ ] Refactor [backend/src/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/index.ts) — `init`, [setup](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts#70-125), [start](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts#15-61) subcommands
- [ ] Refactor [backend/src/cli/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/cli/index.ts) — store config in SQLite, remove [.env](file:///home/deepto/ML-2025/minihands/backend/.env) usage
- [ ] Update [daemon/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts) — read API key from SQLite, remove `dotenv.config()`

## Task 4: AI Agent Execution Loop
- [ ] Add `maxSteps: 10` to `generateText()` with natural stop (no tool calls = done)
- [ ] Add system instruction: "When a tool is denied, do NOT retry"
- [ ] Create `backend/src/daemon/permissionBridge.ts` — async permission flow via WebRTC
- [ ] Refactor [tools.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/tools.ts) — replace CLI `confirm` with `requestPermission()` from bridge
- [ ] Update [PermissionModal.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/components/PermissionModal.tsx) — wire to live `control` channel data
- [ ] Update [Index.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx) — integrate PermissionModal with live WebRTC state

## Task 5: Live Feed Remote Control
- [ ] Add mouse/keyboard event listeners on [LiveScreen](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx#275-327) canvas
- [ ] Calculate relative coords, send JSON payloads over `control` channel (throttled ~50ms)
- [ ] Handle `move`/`click`/`keydown` in daemon [webrtc.ts](file:///home/deepto/ML-2025/minihands/web-ui/src/lib/webrtc.ts) → `nut-js` calls

## Task 6: Virtual Terminal (xterm.js)
- [ ] Add `@xterm/xterm`, `@xterm/addon-fit` to [web-ui/package.json](file:///home/deepto/ML-2025/minihands/web-ui/package.json)
- [ ] Create `backend/src/daemon/shellManager.ts` — `child_process.spawn` persistent shell (NO `node-pty`)
- [ ] Replace [TerminalPane](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx#328-348) with xterm.js instance consuming terminal data channel
- [ ] Wire xterm keystrokes back to daemon stdin via data channel

## Task 7: Build & Packaging
- [ ] Add `tsup` to backend devDependencies
- [ ] Add build scripts: `build:ui` → `build:backend` → copy dist
- [ ] Add `"bin": { "minihands": "./dist/cli.js" }` to backend [package.json](file:///home/deepto/ML-2025/minihands/web-ui/package.json)
- [ ] Test `npm link` / `npx` flow end-to-end
