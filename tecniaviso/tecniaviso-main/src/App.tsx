import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AIPage from "./pages/AIPage";
import KnowledgePage from "./pages/KnowledgePage";
import AuthPage from "./pages/AuthPage";
import InactivePage from "./pages/InactivePage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
});

function AppRoutes() {
  const { user, isActive, isAdmin, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-xs text-muted-foreground">Cargando TecniAviso...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;
  if (!isActive && !isAdmin) return <InactivePage onSignOut={signOut} />;

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/ai" element={<AIPage />} />
      <Route path="/knowledge" element={<KnowledgePage />} />
      {isAdmin && <Route path="/admin" element={<AdminPage />} />}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
