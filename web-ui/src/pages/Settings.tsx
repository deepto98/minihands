import { useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import faviconImg from "/favicon.png";

const tabs = ["General", "API Keys", "Local Daemon"];

function SettingsInput({ label, placeholder, masked = false }: { label: string; placeholder: string; masked?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <input
          type={masked && !show ? "password" : "text"}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all duration-200"
        />
        {masked && (
          <button
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function ToggleSwitch({ label, description }: { label: string; description: string }) {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200 ${on ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-200 ${on ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center gap-2 px-3 md:px-6 py-2.5 md:py-5 border-b border-border bg-card">
        <img
          src={faviconImg}
          alt="MiniHands"
          className="md:hidden shrink-0 h-8 w-8 rounded-full"
          style={{
            mask: "radial-gradient(circle, black 60%, transparent 100%)",
            WebkitMask: "radial-gradient(circle, black 60%, transparent 100%)",
          }}
        />
        <div>
          <h1 className="text-sm md:text-lg font-semibold text-foreground">Settings</h1>
          <p className="hidden md:block text-sm text-muted-foreground mt-1">Configure your MiniHands instance.</p>
        </div>
      </header>

      {/* Mobile: Horizontal Tabs */}
      <div className="flex md:hidden border-b border-border bg-card overflow-x-auto shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
              activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0 bg-background">
        {/* Desktop: Vertical Tabs */}
        <div className="hidden md:block w-48 border-r border-border p-4 space-y-0.5 shrink-0 bg-card">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 active:scale-[0.98] ${
                activeTab === tab
                  ? "bg-primary/8 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-2xl">
          {activeTab === "General" && (
            <div className="space-y-6">
              <h2 className="text-sm md:text-base font-semibold text-foreground">General Settings</h2>
              <SettingsInput label="Instance Name" placeholder="my-minihands-agent" />
              <SettingsInput label="Webhook URL" placeholder="https://hooks.example.com/notify" />
              <ToggleSwitch
                label="Require manual approval for destructive commands"
                description="Commands like rm, drop, format will require explicit user approval."
              />
              <ToggleSwitch
                label="Enable session recording"
                description="Record all terminal and screen activity for later review."
              />
            </div>
          )}

          {activeTab === "API Keys" && (
            <div className="space-y-6">
              <h2 className="text-sm md:text-base font-semibold text-foreground">API Keys</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Keys are encrypted at rest and never leave your local daemon.
              </p>
              <SettingsInput label="OpenAI API Key" placeholder="sk-..." masked />
              <SettingsInput label="Anthropic API Key" placeholder="sk-ant-..." masked />
              <SettingsInput label="Custom Provider Key" placeholder="Enter key..." masked />
            </div>
          )}

          {activeTab === "Local Daemon" && (
            <div className="space-y-6">
              <h2 className="text-sm md:text-base font-semibold text-foreground">Local Daemon</h2>
              <SettingsInput label="Daemon WebRTC PIN" placeholder="••••••" masked />
              <SettingsInput label="Daemon Host" placeholder="localhost" />
              <SettingsInput label="Daemon Port" placeholder="9090" />
              <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-primary/5 border border-primary/10">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <p className="text-[11px] md:text-xs text-muted-foreground">
                  WebRTC connections are end-to-end encrypted. The PIN is used as a shared secret for DTLS handshake verification.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}