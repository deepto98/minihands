# MiniHands Phase 2 Implementation

## Task 1: Local-First Architecture Pivot
- [ ] Add `express` + `@types/express` to [backend/package.json](file:///home/deepto/ML-2025/minihands/backend/package.json)
- [ ] Create `backend/src/daemon/server.ts` — Express server on `:3000` serving static React build + WS signaling
- [ ] Move signaling logic from [signaling-server/src/index.ts](file:///home/deepto/ML-2025/minihands/signaling-server/src/index.ts) into `server.ts` (run on same HTTP server)
- [ ] Update [backend/src/daemon/webrtc.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts) — connect to local `ws://localhost:3000` instead of `:8080`
- [ ] Update [web-ui/src/lib/webrtc.ts](file:///home/deepto/ML-2025/minihands/web-ui/src/lib/webrtc.ts) — default signaling URL to `window.location` (same origin)
- [ ] Hardcode STUN to `stun:stun.l.google.com:19302` (already done in both sides)

## Task 2: Hybrid Tunneling (Cloudflare)
- [ ] Create `backend/src/daemon/tunnelManager.ts` — ephemeral (`cloudflared tunnel --url`) + persistent modes
- [ ] Integrate tunnel startup into daemon boot sequence (`server.ts` or daemon [index.ts](file:///home/deepto/ML-2025/minihands/backend/src/index.ts))

## Task 3: SQLite Configuration & CLI UX
- [ ] Add `better-sqlite3` + `@types/better-sqlite3` to [backend/package.json](file:///home/deepto/ML-2025/minihands/backend/package.json)
- [ ] Create `backend/src/db/config.ts` — SQLite DB at `~/.minihands/config.db` (API keys, tunnel config, prefs)
- [ ] Refactor [backend/src/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/index.ts) CLI — add `init`, [setup](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts#70-125), [start](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts#15-61) subcommands via `commander`
- [ ] Refactor [backend/src/cli/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/cli/index.ts) — `init` wizard stores to SQLite, [setup](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts#70-125) runs cf tunnel login, [start](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts#15-61) boots everything
- [ ] Remove [.env](file:///home/deepto/ML-2025/minihands/backend/.env) / `dotenv` dependency, read API key from SQLite

## Task 4: AI Agent Execution Loop
- [ ] Refactor [backend/src/daemon/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/index.ts) — replace single `generateText` with proper agentic loop (multi-step tool calling)
- [ ] Ensure tool results feed back into LLM context for follow-up tool calls
- [ ] Wire Permission Interceptor to send approval requests via WebRTC `control` channel (not CLI prompts)
- [ ] Update [PermissionModal.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/components/PermissionModal.tsx) to handle live approval requests from data channel

## Task 5: Live Feed Remote Control
- [ ] Update [web-ui/src/pages/Index.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx) [LiveScreen](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx#275-327) — add `onMouseDown`, `onMouseMove`, `onKeyDown` listeners on canvas
- [ ] Calculate relative X/Y coordinates and send JSON payloads over `control` channel
- [ ] Throttle mouse movement to ~15-20 FPS
- [ ] Update [backend/src/daemon/webrtc.ts](file:///home/deepto/ML-2025/minihands/backend/src/daemon/webrtc.ts) — parse control payloads and map to `@nut-tree-fork/nut-js` commands

## Task 6: Virtual Terminal (xterm.js)
- [ ] Add `@xterm/xterm` + `@xterm/addon-fit` to [web-ui/package.json](file:///home/deepto/ML-2025/minihands/web-ui/package.json)
- [ ] Replace [TerminalPane](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx#328-348) in [Index.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx) with xterm.js instance consuming `terminal` data channel
- [ ] Update daemon — spawn persistent `bash`/`powershell` via `child_process.spawn`, pipe stdout/stderr to `terminal` channel
- [ ] Wire xterm keystrokes back over data channel to process stdin

## Task 7: Build & Packaging
- [ ] Add `tsup` to `backend/devDependencies`
- [ ] Create root [package.json](file:///home/deepto/ML-2025/minihands/web-ui/package.json) with monorepo build script: `vite build` → copy `dist/` → `tsup` bundle backend
- [ ] Add `"bin": { "minihands": "./dist/cli.js" }` to backend [package.json](file:///home/deepto/ML-2025/minihands/web-ui/package.json)
- [ ] Test `npm link` / `npx` flow end-to-end
