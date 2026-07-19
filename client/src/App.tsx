import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { getAuthenticatedRedirectPath } from "@/lib/auth-routing";
import Home from "@/pages/home";
import Registration from "@/pages/registration";
import Login from "@/pages/login";
import ResetPassword from "@/pages/reset-password";
import ChangePassword from "@/pages/change-password";
import FindTeacher from "@/pages/find-teacher";
import BecomeTeacher from "@/pages/become-teacher";
import AdminDashboard from "@/pages/admin";
import StudentDashboard from "@/pages/dashboard-student";
import ParentDashboard from "@/pages/dashboard-parent";
import TeacherDashboard from "@/pages/dashboard-teacher";
import Marketplace from "@/pages/marketplace";
import MessagesPage from "@/pages/messages";
import SettingsPage from "@/pages/settings";
import type { User } from "@shared/schema";

function AuthRedirector() {
  const [location, navigate] = useLocation();

  const { data, isLoading } = useQuery<{ user: User }>({
    queryKey: ["/api/user"],
    retry: false,
  });

  useEffect(() => {
    if (isLoading || !data?.user) {
      return;
    }

    const redirectPath = getAuthenticatedRedirectPath(data.user, location);
    if (redirectPath && redirectPath !== location) {
      navigate(redirectPath);
    }
  }, [data?.user, isLoading, location, navigate]);

  return null;
}

function Router() {
  return (
    <>
      <AuthRedirector />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/inscription" component={Registration} />
        <Route path="/connexion" component={Login} />
        <Route path="/reinitialiser-mot-de-passe" component={ResetPassword} />
        <Route path="/changer-mot-de-passe" component={ChangePassword} />
        <Route path="/trouver-professeur" component={FindTeacher} />
        <Route path="/devenir-professeur" component={BecomeTeacher} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/messages" component={MessagesPage} />
        <Route path="/parametres" component={SettingsPage} />
        <Route path="/dashboard/eleve" component={StudentDashboard} />
        <Route path="/dashboard/parent" component={ParentDashboard} />
        <Route path="/dashboard/professeur" component={TeacherDashboard} />
        <Route component={Home} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
