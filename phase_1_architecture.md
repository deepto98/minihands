# MiniHands Project Plan

This document outlines the architecture and phased implementation for MiniHands, a hybrid local/cloud AI agent framework.

## Goal Description
Build a Node.js CLI tool ("MiniHands") and its companion local daemon that executes AI tasks locally and communicates via a pure-TypeScript WebRTC connection (`werift`) with a React web-based control plane. A cloud-hosted WebSocket signaling server will broker the P2P connection using a 6-digit PIN.

## User Review Required
If you agree with this initialization plan, we will proceed to execute the first batch: Setting up git, npm, TypeScript, and the entrypoint CLI!

## Proposed Changes

### Project Foundation
- **Initialize version control:** `git init` and initial commit.
- **Node Environment:** `npm init -y`
- **TypeScript & Build:** Install `typescript`, `@types/node`, [tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx). Create `tsconfig.json`.

### CLI Skeleton
- **Dependencies:** `@clack/prompts`, `picocolors`, `commander`.
- **Files:**
  - [backend/src/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/index.ts) (CLI entry point)
  - [backend/src/cli/index.ts](file:///home/deepto/ML-2025/minihands/backend/src/cli/index.ts) (CLI prompt logic)
### 3. Cloud Signaling Server
- **Dependencies:** `ws`, `express`.
- **Architecture:** A lightweight Node.js WebSocket server to be deployed to the cloud (e.g., Render/Railway).
- **Role:** Handles the exchange of WebRTC SDP Offers, Answers, and ICE Candidates.
- **Handshake:** The daemon connects and registers a 6-digit PIN. The UI connects and joins via that PIN.

### 4. Local Daemon WebRTC (`werift`)
- **Dependencies:** `werift` (Pure TypeScript WebRTC), `ws` (for signaling client).
- **Architecture:** The daemon will establish an `RTCPeerConnection` and connect to the signaling server.
- **Data Channels:**
  - `control`: For user commands, emergency stops, and native input (mouse/keyboard).
  - `terminal`: For streaming `stdout/stderr` logs.
  - `chat`: For streaming AI text responses and status.
  - `screen_feed`: Heavy-duty data channel streaming compressed JPEG buffers (from `screenshot-desktop`) at ~4 FPS, utilizing an asynchronous polling loop to enforce aggressive garbage collection.

### 5. React Web UI Integration
- Wire up the frontend components ([Index.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Index.tsx), [Pairing.tsx](file:///home/deepto/ML-2025/minihands/web-ui/src/pages/Pairing.tsx)) to standard browser WebRTC APIs (`RTCPeerConnection`).
- Communicate with the Cloud Signaling Server to establish the P2P tunnel.
- Replace hardcoded structures with live state managers consuming the WebRTC data channels. The `screen_feed` ArrayBuffers will be rendered via `requestAnimationFrame` to a `<canvas>` or `<img>` tag.

## Verification Plan

### Automated Tests
Run `tsc --noEmit` to verify type checking.
Run `npm run build` once build scripts are added.

### Manual Verification
Run the CLI using `npx tsx src/index.ts` to see the `@clack/prompts` output correctly.
