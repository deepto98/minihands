import { useState } from "react";
import { Octagon, Paperclip, Send, Bot, UserCircle, Monitor } from "lucide-react";

const chatMessages = [
  { role: "user", text: "Deploy the frontend to production." },
  { role: "agent", text: "Understood. I will `cd` into the project directory, run the build step, and deploy via Vercel CLI. Here is my plan:\n\n1. `cd ~/projects/minihands-web`\n2. `npm run build`\n3. `vercel --prod`\n\nProceeding now..." },
  { role: "user", text: "Also run the database migration before deploying." },
  { role: "agent", text: "Adding migration step. I'll run `npx prisma migrate deploy` before the build. Executing now..." },
];

const terminalLines = [
  { text: "$ cd ~/projects/minihands-web", color: "text-muted-foreground" },
  { text: "$ npx prisma migrate deploy", color: "text-primary" },
  { text: "Prisma schema loaded from prisma/schema.prisma", color: "text-muted-foreground" },
  { text: "Datasource \"db\": PostgreSQL database", color: "text-muted-foreground" },
  { text: "1 migration applied successfully.", color: "text-success" },
  { text: "", color: "" },
  { text: "$ npm run build", color: "text-primary" },
  { text: "> minihands-web@1.0.0 build", color: "text-muted-foreground" },
  { text: "> vite build", color: "text-muted-foreground" },
  { text: "", color: "" },
  { text: "vite v5.4.19 building for production...", color: "text-foreground" },
  { text: "transforming (142) src/components/ui/toast.tsx", color: "text-muted-foreground" },
  { text: "✓ 187 modules transformed.", color: "text-success" },
  { text: "rendering chunks (3)...", color: "text-muted-foreground" },
  { text: "computing gzip size (3)...", color: "text-muted-foreground" },
  { text: "dist/index.html              0.46 kB │ gzip: 0.30 kB", color: "text-foreground" },
  { text: "dist/assets/index-Da3x.css  24.18 kB │ gzip: 5.12 kB", color: "text-foreground" },
  { text: "dist/assets/index-K9x2.js  186.42 kB │ gzip: 61.33 kB", color: "text-foreground" },
  { text: "✓ built in 2.84s", color: "text-success" },
  { text: "", color: "" },
  { text: "$ vercel --prod", color: "text-primary" },
  { text: "Vercel CLI 37.2.1", color: "text-muted-foreground" },
  { text: "🔍 Inspect: https://vercel.com/builds/abc123", color: "text-muted-foreground" },
  { text: "⚠ warn: Some assets exceed 500kB threshold", color: "text-warning" },
  { text: "✅ Production: https://minihands.vercel.app [4s]", color: "text-success" },
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
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-mono">running</span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all duration-200 active:scale-95 uppercase tracking-wider">
          <Octagon className="h-4 w-4" />
          Emergency Stop
        </button>
      </header>

      {/* Split Panes */}
      <div className="flex flex-1 min-h-0">
        {/* Left Pane - Agent Interface */}
        <div className="flex flex-col w-1/2 border-r border-border">
          {/* Chat */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 terminal-scrollbar">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "agent" && (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-secondary text-foreground"
                    : "bg-card border border-border text-foreground"
                }`}>
                  <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                </div>
                {msg.role === "user" && (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-secondary flex items-center justify-center mt-0.5">
                    <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="glass-surface rounded-lg p-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Send a command to MiniHands..."
                rows={3}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
              />
              <div className="flex items-center justify-between mt-2">
                <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 active:scale-95">
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
          <div className="relative h-1/2 border-b border-border bg-terminal group">
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute top-3 left-4 flex items-center gap-2">
              <Monitor className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-mono text-primary/60">LIVE FEED</span>
              <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/60 backdrop-blur-sm cursor-pointer">
              <span className="text-sm font-medium text-foreground">AnyDesk Mode: Click to interact</span>
            </div>
          </div>

          {/* Terminal */}
          <div className="h-1/2 bg-terminal overflow-y-auto p-4 terminal-scrollbar">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
              <span className="text-xs font-mono text-muted-foreground ml-2">daemon@local — bash</span>
            </div>
            <div className="space-y-0.5">
              {terminalLines.map((line, i) => (
                <div key={i} className={`text-xs font-mono ${line.color || "text-foreground"} leading-5`}>
                  {line.text || "\u00A0"}
                </div>
              ))}
              <div className="text-xs font-mono text-muted-foreground animate-pulse">▋</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
