import { LayoutDashboard, History, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "History", url: "/history", icon: History },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around border-t border-border bg-card/95 backdrop-blur-md px-2 py-2 safe-bottom">
      {navItems.map((item) => {
        const active = item.url === "/"
          ? location.pathname === "/"
          : location.pathname.startsWith(item.url);
        return (
          <NavLink
            key={item.url}
            to={item.url}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors duration-200 ${
              active
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
