import { useAuth } from "@/_core/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages publiques
import Login from "./pages/Login";

// Pages Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDossiers from "./pages/admin/AdminDossiers";
import AdminDossierDetail from "./pages/admin/AdminDossierDetail";
import AdminClients from "./pages/admin/AdminClients";
import AdminMessagerie from "./pages/admin/AdminMessagerie";

// Pages Client / Prospect
import ClientDashboard from "./pages/client/ClientDashboard";

// Pages Prescripteur
import PrescripteurDashboard from "./pages/prescripteur/PrescripteurDashboard";

// Pages Mandataire
import MandataireDashboard from "./pages/mandataire/MandataireDashboard";

// Notifications (partagé)
import Notifications from "./pages/Notifications";

function AppRoutes() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-brand-navy)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/login" component={Login} />
        <Route component={Login} />
      </Switch>
    );
  }

  const role = user.role;

  return (
    <Switch>
      {/* ── Admin ── */}
      {role === "admin" && (
        <>
          <Route path="/" component={AdminDashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/dossiers" component={AdminDossiers} />
          <Route path="/admin/dossiers/:id" component={AdminDossierDetail} />
          <Route path="/admin/clients" component={AdminClients} />
          <Route path="/admin/prescripteurs" component={AdminClients} />
          <Route path="/admin/mandataires" component={AdminClients} />
          <Route path="/admin/messagerie" component={AdminMessagerie} />
          <Route path="/admin/notifications" component={Notifications} />
        </>
      )}

      {/* ── Client / Prospect ── */}
      {(role === "client" || role === "prospect") && (
        <>
          <Route path="/" component={ClientDashboard} />
          <Route path="/client" component={ClientDashboard} />
          <Route path="/client/dossier" component={ClientDashboard} />
          <Route path="/client/documents" component={ClientDashboard} />
          <Route path="/client/messagerie" component={ClientDashboard} />
          <Route path="/client/notifications" component={Notifications} />
        </>
      )}

      {/* ── Prescripteur ── */}
      {role === "prescripteur" && (
        <>
          <Route path="/" component={PrescripteurDashboard} />
          <Route path="/prescripteur" component={PrescripteurDashboard} />
          <Route path="/prescripteur/apports" component={PrescripteurDashboard} />
          <Route path="/prescripteur/stats" component={PrescripteurDashboard} />
          <Route path="/prescripteur/messagerie" component={PrescripteurDashboard} />
          <Route path="/prescripteur/notifications" component={Notifications} />
        </>
      )}

      {/* ── Mandataire ── */}
      {role === "mandataire" && (
        <>
          <Route path="/" component={MandataireDashboard} />
          <Route path="/mandataire" component={MandataireDashboard} />
          <Route path="/mandataire/portefeuille" component={MandataireDashboard} />
          <Route path="/mandataire/dossiers" component={MandataireDashboard} />
          <Route path="/mandataire/messagerie" component={MandataireDashboard} />
          <Route path="/mandataire/notifications" component={Notifications} />
        </>
      )}

      {/* Notifications communes */}
      <Route path="/notifications" component={Notifications} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AppRoutes />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
