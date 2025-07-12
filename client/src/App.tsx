import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Navbar } from "@/components/ui/navbar";
import { Home } from "@/pages/Home";
import { QuestionDetail } from "@/pages/QuestionDetail";
import { AskQuestion } from "@/pages/AskQuestion";
import { AdminPanel } from "@/pages/AdminPanel";
import { Notifications } from "@/pages/Notifications";
import NotFound from "./pages/NotFound";
import { Profile } from "./pages/Profile";

const queryClient = new QueryClient();

// Loading component for auth initialization
const AuthLoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Helper component to redirect /profile to /users/:username
function NavigateToOwnProfile() {
  const { user } = useAuth();
  if (!user) return <div>Not logged in</div>;
  return <Navigate to={`/users/${user.username}`} replace />;
}

// Main app routes component that handles auth state
const AppRoutes = () => {
  const { isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route path="/ask" element={<AskQuestion />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<NavigateToOwnProfile />} />
        <Route path="/users/:username" element={<Profile />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;