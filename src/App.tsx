import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PermissionModal } from "@/components/PermissionModal";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Index";
import HistoryPage from "./pages/History";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Pairing from "./pages/Pairing";
import ConnectionStatus from "./pages/ConnectionStatus";

const queryClient = new QueryClient();

// Pages that get the app shell (sidebar + mobile nav)
const APP_ROUTES = ["/dashboard", "/history", "/settings"];

function AppLayout() {
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(true);

  const isAppRoute = APP_ROUTES.some(
    (r) => location.pathname === r || location.pathname.startsWith(r + "/")
  );

  return (
    <>
      {isAppRoute ? (
        <div className="flex min-h-screen w-full bg-background">
          <div className="hidden md:block">
            <AppSidebar />
          </div>
          <main className="flex-1 min-w-0 pb-16 md:pb-0">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
          <MobileNav />
          <PermissionModal open={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pairing" element={<Pairing />} />
          <Route path="/connection" element={<ConnectionStatus />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
