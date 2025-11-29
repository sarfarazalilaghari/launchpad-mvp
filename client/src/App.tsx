import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import RoleSelect from "@/pages/RoleSelect";
import FounderDashboard from "@/pages/FounderDashboard";
import InvestorDashboard from "@/pages/InvestorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import PostIdea from "@/pages/PostIdea";
import StartupDetail from "@/pages/StartupDetail";
import Messages from "@/pages/Messages";
import SavedStartups from "@/pages/SavedStartups";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show landing page for non-authenticated users or while loading
  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // If authenticated but no role selected, show role selection
  if (!user?.role) {
    return <RoleSelect />;
  }

  // Founder routes
  if (user.role === "founder") {
    return (
      <Switch>
        <Route path="/" component={FounderDashboard} />
        <Route path="/dashboard" component={FounderDashboard} />
        <Route path="/post-idea" component={PostIdea} />
        <Route path="/startup/:id" component={StartupDetail} />
        <Route path="/messages" component={Messages} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Investor routes
  if (user.role === "investor") {
    return (
      <Switch>
        <Route path="/" component={InvestorDashboard} />
        <Route path="/browse" component={InvestorDashboard} />
        <Route path="/saved" component={SavedStartups} />
        <Route path="/startup/:id" component={StartupDetail} />
        <Route path="/messages" component={Messages} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Admin routes
  if (user.role === "admin") {
    return (
      <Switch>
        <Route path="/" component={AdminDashboard} />
        <Route path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return <NotFound />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
