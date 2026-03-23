# MiniHands: Phase 2 Architecture & Implementation Spec

## Overview & The Paradigm Shift
We are pivoting from a fragmented cloud architecture (Vercel + Render) to a **100% Local-First, All-in-One Executable** model. The user will install a single npm package that contains the Daemon, the Signaling Server, and the compiled React UI. We are completely avoiding C++ binary dependencies (`node-pty`, `wrtc`) and port-forwarding by using pure Node.js WebRTC (`werift`) and Cloudflare Tunnels.

Please implement the following remaining objectives in order.

---

## Task 1: The Local-First Architecture Pivot
We are abandoning the external Vercel deployment and cloud signaling server. The Node.js daemon will now serve the UI and handle signaling locally.

1. **Express Server Integration:** Update the daemon to spin up an Express server on `localhost:3000`.
2. **Static React Serving:** The Express server must statically serve the compiled React Web UI (e.g., `app.use(express.static(path.join(__dirname, '../web-ui/dist')))`). 
3. **Local Signaling:** Move the WebRTC WebSocket signaling logic to run on top of this local Express server. 
4. **STUN Configuration:** Ensure the WebRTC `RTCPeerConnection` (both in `werift` and the React UI) is hardcoded to use `stun:stun.l.google.com:19302` to allow P2P connection upgrades.

## Task 2: Hybrid Tunneling (Cloudflare Zero Trust)
Users need to access `localhost:3000` from their phones. Do not make them configure router ports. We will use the `cloudflared` CLI tool via `child_process`.

Create a `tunnelManager.ts` utility with two modes:
1. **Ephemeral Tunnels (Quick Start):** If no domain is configured, spawn `cloudflared tunnel --url http://localhost:3000`. Parse the stdout to extract the temporary `trycloudflare.com` URL and print it to the user.
2. **Persistent Tunnels (Power User):** If the user has configured a custom domain, spawn `cloudflared tunnel run <tunnel-id>`.

## Task 3: SQLite Configuration & CLI UX
Replace all `.env` usage with `better-sqlite3`. 

1. **Database Setup:** Initialize a local SQLite DB at `os.homedir() + '/.minihands/config.db'`. Store the OpenAI API keys, the Cloudflare tunnel config, and user preferences (framerate, static PIN).
2. **CLI Routing:** Use `commander` and `@clack/prompts` to create an elegant terminal UI:
   * `minihands init`: Wizard to ask for OpenAI keys and preferred framerate.
   * `minihands setup`: Wizard to run `cloudflared tunnel login` and bind a persistent custom domain to a tunnel.
   * `minihands start`: The daily driver. Starts the Express server, checks OS compatibility (e.g., Wayland check), boots the tunnel, and displays the connection URL and PIN.

## Task 4: AI Agent Execution Loop (The Brains)
The LLM needs to act, not just chat. 

1. **Tool Calling Setup:** Define strict JSON schemas for tools like `execute_terminal_command`, `move_mouse_to_coords`, and `type_string`.
2. **The Execution Loop:** When a user sends a prompt via the `chat` WebRTC Data Channel:
   * Pass it to the LLM.
   * If the LLM returns a tool call, route it through the existing **Permission Interceptor**.
   * If approved by the user, execute the native OS action, capture the `stdout`/result, and feed it back to the LLM so it knows the outcome.

## Task 5: Live Feed Remote Control (The Hands)
Wire up the `control` WebRTC Data Channel to allow AnyDesk-style remote control.

1. **React UI (Sender):** Attach `onMouseDown`, `onMouseMove`, and `onKeyDown` listeners to the screen `<canvas>`. Calculate relative X/Y coordinates based on the canvas scale. Send JSON payloads (e.g., `{"type":"move","x":800,"y":600}`) over the `control` channel. 
   * *CRITICAL TRAP:* Throttle mouse movement events to ~15-20 FPS. Do not flood the WebRTC channel.
2. **Daemon (Receiver):** Parse the incoming JSON from the `control` channel and map it directly to `@nut-tree/nut-js` commands to execute the OS-level clicks and keystrokes.

## Task 6: The Virtual Terminal (Pure Node.js)
Provide a full terminal interface in the React UI.

1. *CRITICAL TRAP:* **DO NOT use `node-pty`.** It requires native C++ compilation which will fail on users' machines.
2. **Daemon Side:** Use standard `child_process.spawn` to spawn a persistent `bash` (Linux/Mac) or `powershell` (Windows) instance. Pipe its `stdout` and `stderr` directly into the `terminal` WebRTC Data Channel.
3. **React UI Side:** Use the `xterm.js` library to render the incoming text stream. Capture user keystrokes in xterm and send them back over the data channel to write to the spawned process's `stdin`.

## Task 7: Build & Packaging
Prepare the project for global installation via `npm install -g`.

1. **Monorepo Build Script:** Create a package script that first builds the React UI using Vite (`vite build`).
2. **Asset Moving:** Copy the resulting React `dist` folder into the compiled Daemon directory so the Express server can find it.
3. **Bundling:** Use `tsup` or `esbuild` to compile the entire TypeScript backend into a clean, minified executable.
4. **Bin Entry:** Ensure `package.json` contains `"bin": { "minihands": "./dist/cli.js" }`.