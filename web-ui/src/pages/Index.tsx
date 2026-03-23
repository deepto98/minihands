import { useState, useEffect, useRef } from "react";
import { Octagon, Paperclip, Send, Bot, UserCircle, Monitor, MessageSquare, Terminal, ScreenShare, Maximize2, Minimize2 } from "lucide-react";
import faviconImg from "/favicon.png";
import { useNavigate } from "react-router-dom";
import { WebRTCClient } from "../lib/webrtc";
import { PermissionModal } from "../components/PermissionModal";

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
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [focusPanel, setFocusPanel] = useState<FocusPanel>(null);
  
  // Live State
  const [chatMessages, setChatMessages] = useState<{ role: string, text: string }[]>([]);
  const [terminalLines, setTerminalLines] = useState<{ text: string, color?: string }[]>([]);
  const [status, setStatus] = useState("Connecting...");
  const [permissionPrompt, setPermissionPrompt] = useState<{id: string, command: string} | null>(null);

  useEffect(() => {
    const client = WebRTCClient.instance;
    if (!client.pin) {
      navigate('/pairing');
      return;
    }

    client.onStatusChange = setStatus;
    
    client.onChat = (msg) => {
      setChatMessages(prev => [...prev, { role: msg.role, text: msg.text }]);
    };
    
    client.onTerminal = (log) => {
      setTerminalLines(prev => [...prev, ...log.split('\n').map(l => ({ text: l, color: "text-zinc-300" }))]);
    };

    client.onPermissionRequest = (id, command) => {
      setPermissionPrompt({ id, command });
    };

    return () => {
      client.onChat = null;
      client.onTerminal = null;
      client.onStatusChange = null;
      client.onPermissionRequest = null;
    };
  }, [navigate]);

  const handleSend = () => {
    if (!input.trim()) return;
    setChatMessages(prev => [...prev, { role: "user", text: input }]);
    WebRTCClient.instance.sendCommand(input);
    setInput("");
  };

  const handleEmergencyStop = () => {
    WebRTCClient.instance.sendCommand("EMERGENCY_STOP");
  };

  const showChat = !focusPanel || focusPanel === "chat";
  const showScreen = !focusPanel || focusPanel === "screen";
  const showTerminal = !focusPanel || focusPanel === "terminal";

  return (
    <div className="flex flex-col h-screen">
      <PermissionModal 
        request={permissionPrompt} 
        onResolve={(approved) => {
          if (permissionPrompt) {
            WebRTCClient.instance.sendPermissionResponse(permissionPrompt.id, approved);
          }
          setPermissionPrompt(null);
        }} 
      />

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
          <span className="text-muted-foreground hidden sm:inline">Status:</span>
          <span className="text-foreground font-medium truncate text-xs md:text-sm">{status}</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs bg-success/10 text-success font-medium shrink-0">active</span>
        </div>
        <button onClick={handleEmergencyStop} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-sm font-semibold bg-destructive text-destructive-foreground hover:opacity-90 transition-all duration-200 active:scale-95 uppercase tracking-wider shrink-0">
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
            <ChatPane messages={chatMessages} />
            <ChatInput input={input} setInput={setInput} onSend={handleSend} />
          </div>
        )}

        {(showScreen || showTerminal) && (
          <div className={`flex flex-col min-h-0 transition-all duration-300 ${focusPanel && focusPanel !== "chat" ? "w-full" : "w-1/2"}`}>
            {showScreen && (
              <div className={`flex flex-col min-h-0 ${showTerminal && !focusPanel ? "flex-1 basis-1/2" : "flex-1"} ${showTerminal ? "border-b border-border" : ""}`}>
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-card/50 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <ScreenShare className="h-3.5 w-3.5" />
                    Live Feed
                    <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot ml-1" />
                  </div>
                  <PanelMaxBtn panel="screen" focusPanel={focusPanel} setFocusPanel={setFocusPanel} />
                </div>
                <LiveScreen client={WebRTCClient.instance} full />
              </div>
            )}
            {showTerminal && (
              <div className={`flex flex-col min-h-0 ${showScreen && !focusPanel ? "flex-1 basis-1/2" : "flex-1"}`}>
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-card/50 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Terminal className="h-3.5 w-3.5" />
                    Terminal
                  </div>
                  <PanelMaxBtn panel="terminal" focusPanel={focusPanel} setFocusPanel={setFocusPanel} />
                </div>
                <TerminalPane lines={terminalLines} full />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile: Tabbed Content */}
      <div className="flex md:hidden flex-1 min-h-0 flex-col">
        {mobileTab === "chat" && (
          <>
            <ChatPane messages={chatMessages} />
            <ChatInput input={input} setInput={setInput} onSend={handleSend} />
          </>
        )}
        {mobileTab === "screen" && <LiveScreen client={WebRTCClient.instance} full />}
        {mobileTab === "terminal" && <TerminalPane lines={terminalLines} full />}
      </div>
    </div>
  );
}

function ChatPane({ messages }: { messages: { role: string, text: string }[] }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3 md:space-y-4 terminal-scrollbar bg-background">
      {messages.map((msg, i) => (
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

function ChatInput({ input, setInput, onSend }: { input: string; setInput: (v: string) => void; onSend: () => void }) {
  return (
    <div className="p-3 md:p-4 border-t border-border bg-card">
      <div className="rounded-xl border border-border bg-background p-2.5 md:p-3 shadow-soft">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Send a command to MiniHands..."
          rows={2}
          className="w-full bg-transparent text-xs md:text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
        />
        <div className="flex items-center justify-between mt-1.5 md:mt-2">
          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 active:scale-95">
            <Paperclip className="h-4 w-4" />
          </button>
          <button onClick={onSend} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 active:scale-95">
            <Send className="h-3.5 w-3.5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function LiveScreen({ client, full }: { client: WebRTCClient, full?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const lastObjectUrl = useRef<string | null>(null);

  useEffect(() => {
    client.onScreenFrame = (buffer) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const blob = new Blob([buffer], { type: 'image/jpeg' });
      
      if (lastObjectUrl.current) {
        URL.revokeObjectURL(lastObjectUrl.current);
      }
      
      const url = URL.createObjectURL(blob);
      lastObjectUrl.current = url;

      const img = new Image();
      img.onload = () => {
        animationFrameId.current = requestAnimationFrame(() => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        });
      };
      img.src = url;
    };

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current);
      client.onScreenFrame = null;
    };
  }, [client]);

  const lastSend = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const scale = Math.max(scaleX, scaleY);
    
    // Actual rendered dimensions of the image due to object-contain
    const renderWidth = canvas.width / scale;
    const renderHeight = canvas.height / scale;
    
    // Letterbox offsets
    const offsetX = (rect.width - renderWidth) / 2;
    const offsetY = (rect.height - renderHeight) / 2;
    
    let x = (e.clientX - rect.left - offsetX) * scale;
    let y = (e.clientY - rect.top - offsetY) * scale;
    
    x = Math.max(0, Math.min(canvas.width, Math.round(x)));
    y = Math.max(0, Math.min(canvas.height, Math.round(y)));
    
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCoords(e);
    if (!coords) return;
    isDragging.current = true;
    client.sendCommand(JSON.stringify({ type: 'mousedown', x: coords.x, y: coords.y, button: e.button }));
    // Try to Focus parent to catch keystrokes
    e.currentTarget.parentElement?.focus();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCoords(e);
    if (!coords) return;
    isDragging.current = false;
    client.sendCommand(JSON.stringify({ type: 'mouseup', x: coords.x, y: coords.y, button: e.button }));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (Date.now() - lastSend.current < 50) return; // ~20 FPS throttle
    const coords = getCoords(e);
    if (!coords) return;
    lastSend.current = Date.now();
    client.sendCommand(JSON.stringify({ type: 'mousemove', x: coords.x, y: coords.y }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'F12' || (e.ctrlKey && e.key === 'r') || (e.ctrlKey && e.key === 'c')) return; // Allow browser defaults
    e.preventDefault();
    client.sendCommand(JSON.stringify({ type: 'keydown', key: e.key, code: e.code, modifiers: { ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey, meta: e.metaKey } }));
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'F12' || (e.ctrlKey && e.key === 'r') || (e.ctrlKey && e.key === 'c')) return;
    e.preventDefault();
    client.sendCommand(JSON.stringify({ type: 'keyup', key: e.key, code: e.code, modifiers: { ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey, meta: e.metaKey } }));
  };

  return (
    <div 
      className={`relative flex items-center justify-center ${full ? "flex-1" : "h-1/2"} bg-black border-b border-border group overflow-hidden focus:outline-none focus:ring-1 focus:ring-primary/50`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <canvas 
        ref={canvasRef} 
        width={1920} 
        height={1080} 
        className="w-full h-full object-contain relative z-10 touch-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onContextMenu={(e) => e.preventDefault()}
      />
      <div className="absolute top-3 left-3 md:left-4 z-20 flex items-center gap-2 bg-card/80 px-2 py-1 rounded-md backdrop-blur-sm border border-border/50 pointer-events-none">
        <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] md:text-xs font-mono text-muted-foreground">LIVE FEED</span>
        <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
      </div>
    </div>
  );
}

function TerminalPane({ lines, full }: { lines: { text: string, color?: string }[]; full?: boolean }) {
  return (
    <div className={`${full ? "flex-1" : "h-1/2"} overflow-y-auto overflow-x-hidden break-words p-3 md:p-4 terminal-scrollbar`} style={{ background: "hsl(var(--terminal-bg))" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-amber-400/70" />
        <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-emerald-400/70" />
        <span className="text-[10px] md:text-xs font-mono text-zinc-500 ml-2">daemon@local — bash</span>
      </div>
      <div className="space-y-0.5">
        {lines.map((line, i) => (
          <div key={i} className={`text-[10px] md:text-xs font-mono ${line.color || "text-zinc-300"} leading-5 whitespace-pre-wrap`}>
            {line.text || "\u00A0"}
          </div>
        ))}
        <div className="text-[10px] md:text-xs font-mono text-zinc-500 animate-pulse">▋</div>
      </div>
    </div>
  );
}
