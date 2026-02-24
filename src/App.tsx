import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import OnboardingGuard from "@/components/OnboardingGuard";
import AdminGuard from "@/components/AdminGuard";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import AdminLayout from "@/components/AdminLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Review from "./pages/Review";
import Insights from "./pages/Insights";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={
              <ProtectedRoute><Onboarding /></ProtectedRoute>
            } />
            <Route path="/review" element={
              <ProtectedRoute><MaintenanceGuard><OnboardingGuard><Review /></OnboardingGuard></MaintenanceGuard></ProtectedRoute>
            } />
            <Route path="/insights/:id" element={
              <ProtectedRoute><MaintenanceGuard><Insights /></MaintenanceGuard></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><MaintenanceGuard><OnboardingGuard><Dashboard /></OnboardingGuard></MaintenanceGuard></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><MaintenanceGuard><OnboardingGuard><Profile /></OnboardingGuard></MaintenanceGuard></ProtectedRoute>
            } />
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute><AdminGuard><AdminLayout /></AdminGuard></ProtectedRoute>
            }>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
