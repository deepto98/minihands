import { useState } from "react";
import { Octagon, Paperclip, Send, Bot, UserCircle, Monitor } from "lucide-react";

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
  { text: "Datasource \"db\": PostgreSQL database", color: "text-zinc-500" },
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

export default function Dashboard() {
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col h-screen">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Task:</span>
          <span className="text-foreground font-medium">migrating database & deploying frontend</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-success/10 text-success font-medium">running</span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-destructive text-destructive-foreground hover:opacity-90 transition-all duration-200 active:scale-95 uppercase tracking-wider">
          <Octagon className="h-4 w-4" />
          Emergency Stop
        </button>
      </header>

      {/* Split Panes */}
      <div className="flex flex-1 min-h-0">
        {/* Left Pane - Agent Interface */}
        <div className="flex flex-col w-1/2 border-r border-border">
          {/* Chat */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 terminal-scrollbar bg-background">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "agent" && (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground shadow-soft"
                }`}>
                  <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                </div>
                {msg.role === "user" && (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-accent flex items-center justify-center mt-0.5">
                    <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="rounded-xl border border-border bg-background p-3 shadow-soft">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Send a command to MiniHands..."
                rows={3}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
              />
              <div className="flex items-center justify-between mt-2">
                <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 active:scale-95">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 active:scale-95">
                  <Send className="h-3.5 w-3.5" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane - Machine Interface */}
        <div className="flex flex-col w-1/2">
          {/* Live Screen */}
          <div className="relative h-1/2 border-b border-border bg-muted group">
            <div className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.15) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute top-3 left-4 flex items-center gap-2">
              <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">LIVE FEED</span>
              <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-card/70 backdrop-blur-sm cursor-pointer rounded-none">
              <span className="text-sm font-medium text-foreground px-4 py-2 rounded-lg bg-card shadow-card border border-border">AnyDesk Mode: Click to interact</span>
            </div>
          </div>

          {/* Terminal */}
          <div className="h-1/2 overflow-y-auto p-4 terminal-scrollbar" style={{ background: "hsl(var(--terminal-bg))" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
              <span className="text-xs font-mono text-zinc-500 ml-2">daemon@local — bash</span>
            </div>
            <div className="space-y-0.5">
              {terminalLines.map((line, i) => (
                <div key={i} className={`text-xs font-mono ${line.color || "text-zinc-300"} leading-5`}>
                  {line.text || "\u00A0"}
                </div>
              ))}
              <div className="text-xs font-mono text-zinc-500 animate-pulse">▋</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
