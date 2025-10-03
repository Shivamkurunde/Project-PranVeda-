import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/layout/Navigation";
import { CelebrationOverlay } from "./components/celebrations/CelebrationOverlay";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import { 
  SignIn, 
  SignUp, 
  ForgotPassword, 
  ResetPassword, 
  ProtectedRoute 
} from "./features/auth";
import { Dashboard } from "./features/dashboard";
import { Meditation, Workout, Reports } from "./features/wellness";
import { AICoach } from "./features/ai-coach";
import { validateConfig } from "./config/env";

const queryClient = new QueryClient();

// Validate environment configuration on app startup
try {
  validateConfig();
} catch (error) {
  console.error('❌ App startup failed due to configuration error:', error);
  // You might want to show an error screen here instead of crashing
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="relative">
          <Navigation />
          <CelebrationOverlay />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/meditate" element={<ProtectedRoute><Meditation /></ProtectedRoute>} />
            <Route path="/workout" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
            <Route path="/ai-coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
