import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
// import PublicWebsite from "@/pages/public-website"; // Tijdelijk uitgeschakeld
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import PakketAanmelden from "@/pages/pakket-aanmelden";
import PakketOpzoeken from "@/pages/pakket-opzoeken";
import Manifest from "@/pages/manifest";
import Zeevracht from "@/pages/zeevracht";
import Luchtvracht from "@/pages/luchtvracht";
import Gebruikersbeheer from "@/pages/gebruikersbeheer";
import Logs from "@/pages/logs";
import PrijzenBeheer from "@/pages/prijzen-beheer";
import Afvaartschema from "@/pages/afvaartschema";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/login" component={Dashboard} />
          <Route path="/pakket-aanmelden" component={PakketAanmelden} />
          <Route path="/pakket-opzoeken" component={PakketOpzoeken} />
          <Route path="/manifest" component={Manifest} />
          <Route path="/zeevracht" component={Zeevracht} />
          <Route path="/luchtvracht" component={Luchtvracht} />
          <Route path="/gebruikersbeheer" component={Gebruikersbeheer} />
          <Route path="/logs" component={Logs} />
          <Route path="/prijzen-beheer" component={PrijzenBeheer} />
          <Route path="/afvaartschema" component={Afvaartschema} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
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
