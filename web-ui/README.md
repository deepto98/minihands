# MiniHands — Frontend UI

A React-based dashboard UI for **MiniHands**, an autonomous computer-control agent. This is a **frontend-only** project with hardcoded mock data — designed to be wired up to a real backend.

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** with a custom HSL design token system (see `src/index.css`)
- **shadcn/ui** component library (in `src/components/ui/`)
- **React Router v6** for routing
- **React Query** (`@tanstack/react-query`) — installed and configured, not yet used for data fetching
- **Framer Motion** patterns ready (installed as dependency candidate)
- **Lucide React** for icons

## Project Structure

```
src/
├── pages/
│   ├── Landing.tsx        # Marketing landing page (route: /)
│   ├── Index.tsx          # Main dashboard workspace (route: /dashboard)  ⭐
│   ├── History.tsx        # Session history list (route: /history)
│   ├── Settings.tsx       # Settings panels (route: /settings)
│   ├── Pairing.tsx        # Device pairing flow (route: /pairing)
│   ├── ConnectionStatus.tsx # Connection state screen (route: /connection)
│   └── NotFound.tsx       # 404 page
├── components/
│   ├── AppSidebar.tsx     # Desktop sidebar navigation
│   ├── MobileNav.tsx      # Mobile bottom navigation bar
│   ├── NavLink.tsx        # Reusable nav link with active state
│   ├── MiniHandsLogo.tsx  # Logo component (wordmark with gradient mask)
│   ├── PermissionModal.tsx # First-run permission request modal
│   └── ui/               # shadcn/ui primitives (don't modify unless restyling)
├── App.tsx                # Root layout, routing, providers
├── index.css              # Design tokens, theme variables, global styles
└── main.tsx               # Entry point
```

## Key Pages to Wire Up

### 1. Dashboard (`src/pages/Index.tsx`) — **Most Important**

The main workspace with three panels:

| Panel | Component | What to replace |
|-------|-----------|----------------|
| **Chat** | `ChatPane` + `ChatInput` | `chatMessages` array (line ~6) → real-time agent conversation via WebSocket/API |
| **Live Screen** | `LiveScreen` | Static placeholder → WebRTC video feed or VNC stream |
| **Terminal** | `TerminalPane` | `terminalLines` array (line ~13) → live daemon stdout/stderr stream |

**Desktop** shows split panes with maximize/focus mode (click ⤢ icon on any panel header).  
**Mobile** uses tab switching between the three panels.

#### Hardcoded data to replace:
```typescript
// chatMessages (line 6) — replace with real conversation state
const chatMessages = [
  { role: "user", text: "..." },
  { role: "agent", text: "..." },
];

// terminalLines (line 13) — replace with live terminal output
const terminalLines = [
  { text: "$ command", color: "text-cyan-400" },
];
```

#### State to make dynamic:
- `input` / `setInput` — chat input (wire to send via API/WebSocket)
- Task header info (line ~100): task name, status badge — currently hardcoded strings
- Emergency Stop button — wire to a kill endpoint

### 2. History (`src/pages/History.tsx`)

Session history list. Replace hardcoded session array with API call. Each session has: `id`, `title`, `date`, `duration`, `status`, `steps`.

### 3. Settings (`src/pages/Settings.tsx`)

Tabbed settings panels (Connection, Permissions, Appearance). Replace hardcoded toggle states with persisted user preferences.

### 4. Pairing (`src/pages/Pairing.tsx`)

Device pairing screen. The pairing code input and "Connect" action need backend endpoints.

### 5. Connection Status (`src/pages/ConnectionStatus.tsx`)

Shows connecting/disconnected states. Wire to actual daemon connection health checks.

## Routing & Layout

```
/                → Landing (no app shell)
/pairing         → Pairing (no app shell)
/connection      → ConnectionStatus (no app shell)
/dashboard       → Dashboard (with sidebar + mobile nav)
/history         → History (with sidebar + mobile nav)
/settings        → Settings (with sidebar + mobile nav)
```

App shell routes (`/dashboard`, `/history`, `/settings`) get the sidebar on desktop and bottom nav on mobile. Other routes render standalone.

## Design System

All colors use HSL CSS variables defined in `src/index.css`. Key tokens:

- `--primary` — brand orange
- `--background`, `--foreground` — base colors
- `--card`, `--border` — surface colors
- `--success`, `--terminal-bg` — semantic colors
- `--sidebar-*` — sidebar-specific tokens

**Dark mode** is the default and only theme currently.

## Integration Checklist

- [ ] Replace `chatMessages` in `Index.tsx` with WebSocket/API-driven state
- [ ] Replace `terminalLines` in `Index.tsx` with live daemon output stream
- [ ] Wire `LiveScreen` component to WebRTC/VNC feed
- [ ] Wire `ChatInput` send button to message API
- [ ] Wire Emergency Stop to kill endpoint
- [ ] Replace session data in `History.tsx` with API fetch (use React Query)
- [ ] Persist settings in `Settings.tsx` via API
- [ ] Implement pairing handshake in `Pairing.tsx`
- [ ] Add real connection health polling in `ConnectionStatus.tsx`
- [ ] Add authentication/auth guards if needed

## Development

```bash
npm install
npm run dev        # Start dev server on :5173
npm run build      # Production build
npm run test       # Run vitest tests
```
