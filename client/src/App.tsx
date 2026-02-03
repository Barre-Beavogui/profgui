import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Registration from "@/pages/registration";
import Login from "@/pages/login";
import ChangePassword from "@/pages/change-password";
import FindTeacher from "@/pages/find-teacher";
import BecomeTeacher from "@/pages/become-teacher";
import AdminDashboard from "@/pages/admin";
import StudentDashboard from "@/pages/dashboard-student";
import ParentDashboard from "@/pages/dashboard-parent";
import TeacherDashboard from "@/pages/dashboard-teacher";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/inscription" component={Registration} />
      <Route path="/connexion" component={Login} />
      <Route path="/changer-mot-de-passe" component={ChangePassword} />
      <Route path="/trouver-professeur" component={FindTeacher} />
      <Route path="/devenir-professeur" component={BecomeTeacher} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/dashboard/eleve" component={StudentDashboard} />
      <Route path="/dashboard/parent" component={ParentDashboard} />
      <Route path="/dashboard/professeur" component={TeacherDashboard} />
      <Route component={NotFound} />
    </Switch>
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
