import { useState } from "react";
import { Octagon, Paperclip, Send, Bot, UserCircle, Monitor, MessageSquare, Terminal, ScreenShare, Maximize2, Minimize2 } from "lucide-react";
import faviconImg from "/favicon.png";

const chatMessages = [
  { role: "user", text: "Deploy the frontend to production." },
  { role: "agent", text: "Understood. I will cd into the project directory, run the build step, and deploy via Vercel CLI. Here is my plan:\n\n1. cd ~/projects/minihands-web\n2. npm run build\n3. vercel --prod\n\nProceeding now..." },
  { role: "user", text: "Also run the database migration before deploying." },
  { role: "agent", text: "Adding migration step. I'll run npx prisma migrate deploy before the build. Executing now..." },
];

const terminalLines = [
  { text: "$ cd ~/projects/minihands-web", color: "text-zinc-400" },
  { text: "$ npx prisma migrate deploy", color: "text-cyan-400" },
  { text: "Prisma schema loaded from prisma/schema.prisma", color: "text-zinc-500" },
  { text: 'Datasource "db": PostgreSQL database', color: "text-zinc-500" },
  { text: "1 migration applied successfully.", color: "text-emerald-400" },
  { text: "", color: "" },
  { text: "$ npm run build", color: "text-cyan-400" },
  { text: "> minihands-web@1.0.0 build", color: "text-zinc-500" },
  { text: "> vite build", color: "text-zinc-500" },
  { text: "", color: "" },
  { text: "vite v5.4.19 building for production...", color: "text-zinc-300" },
  { text: "✓ 187 modules transformed.", color: "text-emerald-400" },
  { text: "dist/assets/index-Da3x.css  24.18 kB │ gzip: 5.12 kB", color: "text-zinc-400" },
  { text: "dist/assets/index-K9x2.js  186.42 kB │ gzip: 61.33 kB", color: "text-zinc-400" },
  { text: "✓ built in 2.84s", color: "text-emerald-400" },
  { text: "", color: "" },
  { text: "$ vercel --prod", color: "text-cyan-400" },
  { text: "⚠ warn: Some assets exceed 500kB threshold", color: "text-amber-400" },
  { text: "✅ Production: https://minihands.vercel.app [4s]", color: "text-emerald-400" },
];

type MobileTab = "chat" | "screen" | "terminal";
type FocusPanel = "chat" | "screen" | "terminal" | null;

const panelMeta = [
  { key: "chat" as const, label: "Chat", icon: MessageSquare },
  { key: "screen" as const, label: "Screen", icon: ScreenShare },
  { key: "terminal" as const, label: "Terminal", icon: Terminal },
];

function PanelMaxBtn({ panel, focusPanel, setFocusPanel }: { panel: FocusPanel; focusPanel: FocusPanel; setFocusPanel: (v: FocusPanel) => void }) {
  const isMaximized = focusPanel === panel;
  return (
    <button
      onClick={() => setFocusPanel(isMaximized ? null : panel)}
      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 active:scale-90"
      title={isMaximized ? "Restore" : "Maximize"}
    >
      {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
    </button>
  );
}

function FocusBar({ focusPanel, setFocusPanel }: { focusPanel: FocusPanel; setFocusPanel: (v: FocusPanel) => void }) {
  if (!focusPanel) return null;
  return (
    <div className="hidden md:flex items-center gap-1 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-1.5 shrink-0">
      {panelMeta.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setFocusPanel(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            focusPanel === key
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
      <div className="flex-1" />
      <button
        onClick={() => setFocusPanel(null)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
      >
        <Minimize2 className="h-3.5 w-3.5" />
        Split View
      </button>
    </div>
  );
}

export default function Dashboard() {
  const [input, setInput] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [focusPanel, setFocusPanel] = useState<FocusPanel>(null);

  const showChat = !focusPanel || focusPanel === "chat";
  const showScreen = !focusPanel || focusPanel === "screen";
  const showTerminal = !focusPanel || focusPanel === "terminal";

  return (
    <div className="flex flex-col h-screen">
      {/* Top Header */}
      <header className="flex items-center justify-between px-3 md:px-6 py-2.5 md:py-3 border-b border-border bg-card shrink-0 gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <img
            src={faviconImg}
            alt="MiniHands"
            className="md:hidden shrink-0 h-8 w-8 rounded-full"
            style={{
              mask: "radial-gradient(circle, black 60%, transparent 100%)",
              WebkitMask: "radial-gradient(circle, black 60%, transparent 100%)",
            }}
          />
          <span className="text-muted-foreground hidden sm:inline">Task:</span>
          <span className="text-foreground font-medium truncate text-xs md:text-sm">migrating database & deploying frontend</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs bg-success/10 text-success font-medium shrink-0">running</span>
        </div>
        <button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-sm font-semibold bg-destructive text-destructive-foreground hover:opacity-90 transition-all duration-200 active:scale-95 uppercase tracking-wider shrink-0">
          <Octagon className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Emergency</span> Stop
        </button>
      </header>

      {/* Desktop Focus Bar (visible when a panel is maximized) */}
      <FocusBar focusPanel={focusPanel} setFocusPanel={setFocusPanel} />

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden border-b border-border bg-card shrink-0">
        {panelMeta.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMobileTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors duration-200 ${
              mobileTab === key
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Desktop: Split Panes (or focused single pane) */}
      <div className="hidden md:flex flex-1 min-h-0">
        {showChat && (
          <div className={`flex flex-col border-r border-border transition-all duration-300 ${focusPanel === "chat" ? "w-full" : "w-1/2"}`}>
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-card/50 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                Chat
              </div>
              <PanelMaxBtn panel="chat" focusPanel={focusPanel} setFocusPanel={setFocusPanel} />
            </div>
            <ChatPane />
            <ChatInput input={input} setInput={setInput} />
          </div>
        )}

        {(showScreen || showTerminal) && (
          <div className={`flex flex-col transition-all duration-300 ${focusPanel && focusPanel !== "chat" ? "w-full" : "w-1/2"}`}>
            {showScreen && (
              <div className={`flex flex-col ${showTerminal && !focusPanel ? "h-1/2" : "flex-1"} ${showTerminal ? "border-b border-border" : ""}`}>
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-card/50 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <ScreenShare className="h-3.5 w-3.5" />
                    Live Feed
                    <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot ml-1" />
                  </div>
                  <PanelMaxBtn panel="screen" focusPanel={focusPanel} setFocusPanel={setFocusPanel} />
                </div>
                <LiveScreen full={focusPanel === "screen"} />
              </div>
            )}
            {showTerminal && (
              <div className={`flex flex-col ${showScreen && !focusPanel ? "h-1/2" : "flex-1"}`}>
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-card/50 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Terminal className="h-3.5 w-3.5" />
                    Terminal
                  </div>
                  <PanelMaxBtn panel="terminal" focusPanel={focusPanel} setFocusPanel={setFocusPanel} />
                </div>
                <TerminalPane full={focusPanel === "terminal"} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile: Tabbed Content */}
      <div className="flex md:hidden flex-1 min-h-0 flex-col">
        {mobileTab === "chat" && (
          <>
            <ChatPane />
            <ChatInput input={input} setInput={setInput} />
          </>
        )}
        {mobileTab === "screen" && <LiveScreen full />}
        {mobileTab === "terminal" && <TerminalPane full />}
      </div>
    </div>
  );
}

function ChatPane() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3 md:space-y-4 terminal-scrollbar bg-background">
      {chatMessages.map((msg, i) => (
        <div key={i} className={`flex gap-2.5 md:gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
          {msg.role === "agent" && (
            <div className="shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <Bot className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
            </div>
          )}
          <div className={`max-w-[85%] md:max-w-[80%] rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm leading-relaxed ${
            msg.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-foreground shadow-soft"
          }`}>
            <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
          </div>
          {msg.role === "user" && (
            <div className="shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-accent flex items-center justify-center mt-0.5">
              <UserCircle className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ChatInput({ input, setInput }: { input: string; setInput: (v: string) => void }) {
  return (
    <div className="p-3 md:p-4 border-t border-border bg-card">
      <div className="rounded-xl border border-border bg-background p-2.5 md:p-3 shadow-soft">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a command to MiniHands..."
          rows={2}
          className="w-full bg-transparent text-xs md:text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
        />
        <div className="flex items-center justify-between mt-1.5 md:mt-2">
          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 active:scale-95">
            <Paperclip className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 active:scale-95">
            <Send className="h-3.5 w-3.5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function LiveScreen({ full }: { full?: boolean }) {
  return (
    <div className={`relative ${full ? "flex-1" : "h-1/2"} border-b border-border bg-muted group`}>
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.15) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-3 left-3 md:left-4 flex items-center gap-2">
        <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] md:text-xs font-mono text-muted-foreground">LIVE FEED</span>
        <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-card/70 backdrop-blur-sm cursor-pointer">
        <span className="text-xs md:text-sm font-medium text-foreground px-3 md:px-4 py-2 rounded-lg bg-card shadow-card border border-border">AnyDesk Mode: Click to interact</span>
      </div>
    </div>
  );
}

function TerminalPane({ full }: { full?: boolean }) {
  return (
    <div className={`${full ? "flex-1" : "h-1/2"} overflow-y-auto p-3 md:p-4 terminal-scrollbar`} style={{ background: "hsl(var(--terminal-bg))" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-amber-400/70" />
        <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-emerald-400/70" />
        <span className="text-[10px] md:text-xs font-mono text-zinc-500 ml-2">daemon@local — bash</span>
      </div>
      <div className="space-y-0.5">
        {terminalLines.map((line, i) => (
          <div key={i} className={`text-[10px] md:text-xs font-mono ${line.color || "text-zinc-300"} leading-5`}>
            {line.text || "\u00A0"}
          </div>
        ))}
        <div className="text-[10px] md:text-xs font-mono text-zinc-500 animate-pulse">▋</div>
      </div>
    </div>
  );
}
