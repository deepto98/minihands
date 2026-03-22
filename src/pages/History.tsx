import { CheckCircle2, XCircle, Skull, Clock } from "lucide-react";

const sessions = [
  { date: "2026-03-22 14:32", task: "Deploy frontend to production via Vercel CLI", duration: "2m 14s", status: "success" },
  { date: "2026-03-22 11:05", task: "Run database migration on staging environment", duration: "0m 48s", status: "success" },
  { date: "2026-03-21 22:18", task: "Full system backup to S3 bucket", duration: "8m 33s", status: "failed" },
  { date: "2026-03-21 16:44", task: "Clean up Docker containers and unused images", duration: "1m 02s", status: "success" },
  { date: "2026-03-21 09:12", task: "Attempt to reformat /dev/sda1 partition", duration: "0m 06s", status: "killed" },
  { date: "2026-03-20 19:55", task: "Install Node.js dependencies and run test suite", duration: "3m 27s", status: "success" },
  { date: "2026-03-20 14:01", task: "Compile Rust backend service for arm64", duration: "12m 41s", status: "failed" },
  { date: "2026-03-19 10:30", task: "Sync local .env files from Vault secrets manager", duration: "0m 22s", status: "success" },
];

const statusConfig = {
  success: { icon: CheckCircle2, label: "Success", classes: "bg-success/10 text-success border-success/20" },
  failed: { icon: XCircle, label: "Failed", classes: "bg-destructive/10 text-destructive border-destructive/20" },
  killed: { icon: Skull, label: "Killed", classes: "bg-destructive/5 text-destructive/70 border-destructive/15" },
};

export default function HistoryPage() {
  return (
    <div className="flex flex-col h-screen">
      <header className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">Session History</h1>
        <p className="text-sm text-muted-foreground mt-1">All recorded agent sessions and their outcomes.</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Task Summary</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => {
                const cfg = statusConfig[s.status as keyof typeof statusConfig];
                const Icon = cfg.icon;
                return (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors duration-150">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{s.date}</td>
                    <td className="px-4 py-3 text-foreground">{s.task}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {s.duration}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.classes}`}>
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
