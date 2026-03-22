import { AlertTriangle, X } from "lucide-react";

interface PermissionModalProps {
  open: boolean;
  onClose: () => void;
}

export function PermissionModal({ open, onClose }: PermissionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="glass-surface rounded-lg w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Permission Required
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">
            MiniHands is attempting to execute:
          </p>
          <code className="block px-3 py-2 rounded-md bg-terminal text-destructive font-mono text-sm border border-border">
            rm -rf ./node_modules
          </code>
          <p className="text-sm text-muted-foreground mt-3">
            Allow this action?
          </p>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium bg-secondary text-foreground hover:bg-surface-hover transition-all duration-200 active:scale-95"
          >
            Allow
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all duration-200 active:scale-95"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
}
