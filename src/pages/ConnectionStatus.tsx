import { useEffect, useState } from "react";
import { Loader2, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConnectionState = "connecting" | "lost";

interface ConnectionStatusProps {
  state?: ConnectionState;
}

const ConnectionStatus = ({ state: initialState = "connecting" }: ConnectionStatusProps) => {
  const [state, setState] = useState<ConnectionState>(initialState);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (state !== "connecting") return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [state]);

  // Demo: switch to "lost" after 5s for preview
  useEffect(() => {
    const t = setTimeout(() => setState("lost"), 5000);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = () => {
    setState("connecting");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-xs flex-col items-center gap-6 text-center">
        {state === "connecting" ? (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-semibold text-foreground">
                Connecting to Daemon{dots}
              </h2>
              <p className="text-sm text-muted-foreground">
                Establishing a secure connection to your local machine.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">
                Waiting for WebRTC handshake
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <WifiOff className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-semibold text-foreground">
                Connection Lost
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your machine may be asleep or the daemon stopped. Check your terminal and try again.
              </p>
            </div>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="gap-2 h-10 transition-all duration-200 active:scale-[0.97]"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
