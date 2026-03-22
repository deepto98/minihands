import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PermissionModal } from "@/components/PermissionModal";
import Index from "./pages/Index";
import HistoryPage from "./pages/History";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Pairing from "./pages/Pairing";
import ConnectionStatus from "./pages/ConnectionStatus";

const queryClient = new QueryClient();

const App = () => {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex min-h-screen w-full bg-background">
            {/* Desktop sidebar */}
            <div className="hidden md:block">
              <AppSidebar />
            </div>
            <main className="flex-1 min-w-0 pb-16 md:pb-0">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/pairing" element={<Pairing />} />
                <Route path="/connection" element={<ConnectionStatus />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
          {/* Mobile bottom nav */}
          <MobileNav />
          <PermissionModal open={modalOpen} onClose={() => setModalOpen(false)} />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
