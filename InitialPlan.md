Here is the comprehensive Product Requirements Document (PRD) for MiniHands. It is optimized exactly for your goal: handing it off to an AI coding assistant to get a feature-rich, beautiful prototype running as quickly as possible.

To prioritize development speed and a premium user experience over raw, bare-metal performance, we are utilizing the modern TypeScript/React ecosystem.

Product Specification: MiniHands
1. Project Overview
MiniHands is a hybrid local/cloud AI agent framework. It runs a local Node.js daemon with full system and GUI access, controlled via a securely tunneled, static Web UI hosted on Vercel/Cloudflare. It provides real-time WebRTC video streaming of the user's screen, live terminal log streaming, and remote mouse/keyboard control, bypassing the need for third-party messaging apps like Telegram.

2. Tech Stack (Optimized for Dev Speed & UI)
Local Daemon & CLI: Node.js + TypeScript.

CLI UI: @clack/prompts (for ultra-sleek, modern terminal prompts) and picocolors.

Native Automation: @nut-tree/nut-js (for cross-platform screen capture, mouse, and keyboard control).

WebRTC: node-datachannel (lightweight WebRTC implementation for Node).

LLM Orchestration: Vercel AI SDK or direct OpenAI/Anthropic API calls.

Web Control Plane (Frontend): React (Vite) + TypeScript.

Styling: Tailwind CSS + shadcn/ui components (Dark mode default).

Icons: Lucide React.

Deployment: Vercel (invoked programmatically via the CLI).

Signaling Server: * A lightweight Node.js/WebSocket server (deployed to Render, Fly.io, or Railway) to exchange WebRTC SDP offers/answers between the frontend and the local daemon.

3. Design Language & UX
Both the CLI and Web UI must share a cohesive, "hacker-chic" but polished aesthetic (similar to Vercel, Linear, or Raycast).

Color Palette: Deep black background (#000000 or #09090B), stark white text (#FAFAFA), and a vibrant accent color for active states (e.g., Electric Cyan #06B6D4 or Neon Green #10B981 for safe actions, Crimson #EF4444 for the Kill Switch).

Typography: Inter (for UI elements) and JetBrains Mono or Fira Code (for all terminal outputs and logs).

CLI Behavior: Instead of dumping raw text, the CLI should use @clack/prompts spinners, bordered boxes for pairing codes, and clear success/error states.

4. Core Workflows
A. Initialization & Deployment (npx minihands init)
User runs the CLI command.

CLI uses @clack/prompts to ask for an OpenAI/Anthropic API key (saves securely to .env).

CLI prompts: "Deploy control plane to Vercel?"

CLI executes the Vercel CLI programmatically to deploy the static Vite React app.

CLI generates a secure, random 6-digit Pairing PIN and displays it in a stylized terminal box.

B. The Connection (WebRTC Handshake)
User opens the newly deployed Vercel URL on their phone/laptop.

Web UI presents a clean, minimalist lock screen requesting the 6-digit PIN.

Upon entry, the Web UI connects to the Signaling Server via WebSocket, passes the PIN, and finds the local daemon.

WebRTC peer-to-peer connection is established. WebSocket disconnects. All subsequent data (video, chat, logs) flows directly P2P.

5. Feature Specifications & "Quirks"
Feature 1: The AI Chat & Command Interface
UI: A sticky text input at the bottom of the screen (iMessage style) with an attachment button (for uploading files to the local machine).

Execution: Commands sent via WebRTC Data Channel. The local daemon receives the text, passes it to the LLM, and triggers local tool functions (e.g., executeTerminal, readFileSystem, clickMouse).

Quirk: The chat must support markdown rendering so the AI can return formatted code blocks before executing them.

Feature 2: Live Log Streaming (The Virtual Terminal)
UI: A resizable panel (defaulting to the right side or top half on mobile) styled like a raw terminal window (black background, monospace text).

Execution: When the daemon spawns a child_process to run a command (e.g., git push), it captures stdout and stderr on the data event.

Quirk: It must stream these chunks over the WebRTC Data Channel immediately. Do not wait for the process to exit. The Web UI terminal should auto-scroll to the bottom.

Feature 3: Live Screen Feed & Remote Control (AnyDesk Mode)
UI: A canvas element in the Web UI displaying the live desktop feed.

Execution: @nut-tree/nut-js captures screen frames on the local daemon and pipes them to the WebRTC Video Track.

Quirk (Remote Input): Add onClick and onKeyDown event listeners to the Web UI canvas. When a user clicks the canvas, translate the browser X/Y coordinates to the host machine's resolution, send the coordinates via WebRTC, and use nut.js to execute a physical mouse click locally.

Feature 4: The Hardware Kill Switch (Emergency Stop)
UI: A persistent, prominent red "STOP" button in the Web UI header.

Execution: Clicking it instantly sends a { type: 'KILL_SIGNAL' } payload via the WebRTC Data Channel.

Quirk: The Node.js daemon must have an event listener with the highest priority. Upon receiving this signal, it must forcefully run process.kill() on any active child processes and halt the LLM execution loop immediately.

Feature 5: Permission Interceptor (The Watchdog)
Execution: Before the LLM executes specific high-risk system commands (e.g., rm -rf, format, or API deployments), the daemon halts execution.

UI: It sends a payload to the Web UI, triggering a centered modal dialog: "Agent wants to execute: rm -rf /build. Allow or Deny?"

Quirk: The LLM context must be put into a "waiting state." If the user clicks Deny, the daemon feeds an error back to the LLM: "User denied permission for this action. Find another way or ask for clarification."

6. Known Edge Cases for the AI to Handle
Resolution Mismatch: When mapping remote clicks from a mobile phone screen to a 4K desktop monitor, the X/Y coordinate math must account for aspect ratio scaling.

WebRTC NAT Traversal: The signaling server must provide free STUN servers (like Google's public STUN) in the WebRTC configuration so the P2P connection succeeds across standard home routers.

Headless vs Windowed: If the user asks the agent to "browse a website," the agent must use a tool like Puppeteer. Ensure the PRD instructs the AI to launch Puppeteer in headless: false mode so the action is visible on the WebRTC screen capture.