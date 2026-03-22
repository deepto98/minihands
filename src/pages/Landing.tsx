import { ArrowRight, Github, Terminal, Monitor, Shield, Zap, ChevronRight, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/minihands-logo.png";
import { MiniHandsLogo } from "@/components/MiniHandsLogo";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <InstallBlock />
      <Features />
      <Architecture />
      <TerminalDemo />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="MiniHands" className="w-7 h-7 rounded-lg" />
          <span className="text-sm font-semibold tracking-tight">MiniHands</span>
          <span className="hidden sm:inline-flex ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
            v0.3.0-beta
          </span>
        </div>
        <div className="flex items-center gap-1">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a href="#docs"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
            Docs
          </a>
          <Link to="/pairing"
            className="flex items-center gap-1.5 ml-1 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 active:scale-95">
            Open App
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--primary) / 0.06) 0%, transparent 70%)`
        }}
      />
      <div className="max-w-5xl mx-auto px-4 pt-16 md:pt-24 pb-12 md:pb-20">
        <div className="flex flex-col items-start max-w-2xl">
          {/* Eyebrow */}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all duration-200 mb-8 md:mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Now open source — Star on GitHub
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] text-foreground">
            Your computer,{" "}
            <span className="text-primary">on autopilot.</span>
          </h1>

          {/* Logo + Name */}
          <MiniHandsLogo size="lg" className="mt-6 md:mt-8" />

          <p className="mt-4 md:mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
            MiniHands is an open-source AI agent that lives on your machine. 
            It sees your screen, types on your keyboard, and executes shell commands — 
            controlled remotely from any device via WebRTC.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-7 md:mt-8">
            <Link to="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-foreground text-background hover:opacity-90 transition-all duration-200 active:scale-[0.97]">
              Live Demo
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a href="#install"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border bg-card text-foreground hover:bg-accent transition-all duration-200 active:scale-[0.97]">
              Quick Start
            </a>
          </div>

          <div className="flex items-center gap-4 mt-8 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Github className="h-3 w-3" /> 2.4k stars
            </span>
            <span className="w-px h-3 bg-border" />
            <span>MIT Licensed</span>
            <span className="w-px h-3 bg-border" />
            <span>Works on macOS, Linux, Windows</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function InstallBlock() {
  const [copied, setCopied] = useState(false);
  const cmd = "npx minihands@latest init";

  function handleCopy() {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="install" className="max-w-5xl mx-auto px-4 pb-16 md:pb-20">
      <div className="rounded-xl border border-border overflow-hidden shadow-card">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-card border-b border-border">
          <div className="w-2 h-2 rounded-full bg-destructive/40" />
          <div className="w-2 h-2 rounded-full bg-warning/40" />
          <div className="w-2 h-2 rounded-full bg-success/40" />
          <span className="text-[10px] font-mono text-muted-foreground ml-2">terminal</span>
        </div>
        <div className="flex items-center justify-between px-4 md:px-5 py-3.5 md:py-4" style={{ background: "hsl(var(--terminal-bg))" }}>
          <code className="text-xs md:text-sm font-mono text-zinc-300">
            <span className="text-zinc-500">$</span> {cmd}
          </code>
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-all duration-200 active:scale-95">
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Monitor, title: "Screen Streaming", desc: "WebRTC-powered live feed of your desktop. Sub-100ms latency, no port forwarding required." },
    { icon: Terminal, title: "Shell Execution", desc: "Full terminal access with streaming output. Run builds, deployments, and scripts remotely." },
    { icon: Shield, title: "Permission Gating", desc: "Destructive commands require explicit approval. rm, drop, format — nothing runs without your OK." },
    { icon: Zap, title: "Local-First", desc: "The daemon runs entirely on your machine. No cloud middleman. Your data never leaves your network." },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 pb-16 md:pb-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {items.map((item) => (
          <div key={item.title}
            className="group p-5 md:p-6 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-card transition-all duration-300">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/8 mb-4">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">{item.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Architecture() {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-16 md:pb-24">
      <div className="text-center mb-8 md:mb-10">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">How it works</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          A simple three-part architecture. No accounts, no cloud dependencies, no vendor lock-in.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {[
          { step: "01", title: "Install the daemon", desc: "One command installs and starts the MiniHands daemon on your machine. It generates a 6-digit pairing PIN." },
          { step: "02", title: "Pair from any device", desc: "Open the web UI on your phone or another laptop. Enter the PIN to establish a secure WebRTC tunnel." },
          { step: "03", title: "Give instructions", desc: "Chat with the AI agent. It executes commands, navigates your screen, and streams everything back live." },
        ].map((s) => (
          <div key={s.step} className="p-5 md:p-6 bg-card">
            <span className="text-xs font-mono text-primary font-semibold">{s.step}</span>
            <h3 className="text-sm font-semibold text-foreground mt-2 mb-1.5">{s.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TerminalDemo() {
  const lines = [
    { text: "$ minihands init", cls: "text-zinc-300" },
    { text: "", cls: "" },
    { text: "  ╭─────────────────────────────────────╮", cls: "text-zinc-500" },
    { text: "  │                                     │", cls: "text-zinc-500" },
    { text: "  │   MiniHands v0.3.0                  │", cls: "text-zinc-300" },
    { text: "  │   Daemon running on :4819           │", cls: "text-zinc-500" },
    { text: "  │                                     │", cls: "text-zinc-500" },
    { text: "  │   Pairing PIN: 847 291              │", cls: "text-emerald-400" },
    { text: "  │                                     │", cls: "text-zinc-500" },
    { text: "  │   Screen capture ✓  Audio ✗         │", cls: "text-zinc-500" },
    { text: "  │   Shell access  ✓  GPU accel ✓      │", cls: "text-zinc-500" },
    { text: "  │                                     │", cls: "text-zinc-500" },
    { text: "  ╰─────────────────────────────────────╯", cls: "text-zinc-500" },
    { text: "", cls: "" },
    { text: "  Waiting for connection...", cls: "text-zinc-400" },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 pb-16 md:pb-24">
      <div className="rounded-xl border border-border overflow-hidden shadow-card">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-card border-b border-border">
          <div className="w-2 h-2 rounded-full bg-destructive/40" />
          <div className="w-2 h-2 rounded-full bg-warning/40" />
          <div className="w-2 h-2 rounded-full bg-success/40" />
          <span className="text-[10px] font-mono text-muted-foreground ml-2">minihands — daemon</span>
        </div>
        <div className="p-4 md:p-5 overflow-x-auto" style={{ background: "hsl(var(--terminal-bg))" }}>
          {lines.map((line, i) => (
            <div key={i} className={`text-[11px] md:text-xs font-mono ${line.cls || "text-zinc-300"} leading-5 whitespace-pre`}>
              {line.text || "\u00A0"}
            </div>
          ))}
          <div className="text-xs font-mono text-zinc-500 animate-pulse mt-1">▋</div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="max-w-5xl mx-auto px-4 pb-16 md:pb-24">
      <div className="rounded-xl border border-border bg-card p-8 md:p-12 text-center">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Ready to put your computer on autopilot?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          MiniHands is free, open-source, and takes 30 seconds to install.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-foreground text-background hover:opacity-90 transition-all duration-200 active:scale-[0.97]">
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
          <a href="#docs"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-accent transition-all duration-200 active:scale-[0.97]">
            Read the Docs
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <img src={logo} alt="MiniHands" className="w-5 h-5 rounded" />
          MiniHands — MIT License
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a href="https://github.com" className="hover:text-foreground transition-colors">GitHub</a>
          <a href="#docs" className="hover:text-foreground transition-colors">Documentation</a>
          <a href="#" className="hover:text-foreground transition-colors">Discord</a>
        </div>
      </div>
    </footer>
  );
}
