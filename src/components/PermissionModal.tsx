import { AlertTriangle, X } from "lucide-react";

interface PermissionModalProps {
  open: boolean;
  onClose: () => void;
}

export function PermissionModal({ open, onClose }: PermissionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card rounded-xl w-full max-w-md p-6 shadow-card border border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
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
          <code className="block px-3 py-2 rounded-lg bg-muted text-destructive font-mono text-sm">
            rm -rf ./node_modules
          </code>
          <p className="text-sm text-muted-foreground mt-3">
            Allow this action?
          </p>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-foreground hover:bg-muted transition-all duration-200 active:scale-95"
          >
            Allow
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:opacity-90 transition-all duration-200 active:scale-95"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
}
