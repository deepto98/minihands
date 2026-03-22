import { LayoutDashboard, History, Settings, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { MiniHandsLogo } from "@/components/MiniHandsLogo";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Session History", url: "/history", icon: History },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="flex flex-col w-56 min-h-screen border-r border-border bg-sidebar shrink-0">
      {/* Logo */}
      <div className="flex items-center px-5 py-5 border-b border-border">
        <MiniHandsLogo size="sm" className="[&_img]:rounded-lg [&_img]:[mask:linear-gradient(to_right,transparent_0%,black_4%,black_96%,transparent_100%),linear-gradient(to_bottom,transparent_0%,black_4%,black_96%,transparent_100%)] [&_img]:[mask-composite:intersect] [&_img]:[-webkit-mask:linear-gradient(to_right,transparent_0%,black_4%,black_96%,transparent_100%),linear-gradient(to_bottom,transparent_0%,black_4%,black_96%,transparent_100%)] [&_img]:[-webkit-mask-composite:destination-in]" />
      </div>

      {/* Status */}
      <div className="px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success pulse-dot" />
          Daemon Connected
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = location.pathname === item.url || location.pathname.startsWith(item.url + "/");
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                active
                  ? "bg-primary/8 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              activeClassName=""
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Admin</span>
            <span className="text-xs text-muted-foreground">Local Daemon</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
