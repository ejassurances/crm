import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Network,
  Settings,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";

const LOGO_URL = "/manus-storage/Logo-EJPartnersAssurances_4826a8ff.png";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case "admin":
      return [
        { label: "Tableau de bord", href: "/admin", icon: <LayoutDashboard size={18} /> },
        { label: "Dossiers", href: "/admin/dossiers", icon: <FolderOpen size={18} /> },
        { label: "Clients & Prospects", href: "/admin/clients", icon: <Users size={18} /> },
        { label: "Prescripteurs", href: "/admin/prescripteurs", icon: <Network size={18} /> },
        { label: "Mandataires", href: "/admin/mandataires", icon: <BriefcaseBusiness size={18} /> },
        { label: "Messagerie", href: "/admin/messagerie", icon: <MessageSquare size={18} /> },
        { label: "Paramètres", href: "/admin/parametres", icon: <Settings size={18} /> },
      ];
    case "client":
    case "prospect":
      return [
        { label: "Mon espace", href: "/client", icon: <LayoutDashboard size={18} /> },
        { label: "Mon dossier", href: "/client/dossier", icon: <FolderOpen size={18} /> },
        { label: "Mes documents", href: "/client/documents", icon: <FileText size={18} /> },
        { label: "Messagerie", href: "/client/messagerie", icon: <MessageSquare size={18} /> },
      ];
    case "prescripteur":
      return [
        { label: "Tableau de bord", href: "/prescripteur", icon: <LayoutDashboard size={18} /> },
        { label: "Mes apports", href: "/prescripteur/apports", icon: <Network size={18} /> },
        { label: "Statistiques", href: "/prescripteur/stats", icon: <Building2 size={18} /> },
        { label: "Messagerie", href: "/prescripteur/messagerie", icon: <MessageSquare size={18} /> },
      ];
    case "mandataire":
      return [
        { label: "Tableau de bord", href: "/mandataire", icon: <LayoutDashboard size={18} /> },
        { label: "Portefeuille", href: "/mandataire/portefeuille", icon: <Wallet size={18} /> },
        { label: "Dossiers", href: "/mandataire/dossiers", icon: <FolderOpen size={18} /> },
        { label: "Messagerie", href: "/mandataire/messagerie", icon: <MessageSquare size={18} /> },
      ];
    default:
      return [];
  }
}

function getRoleBadge(role: string) {
  const map: Record<string, { label: string; className: string }> = {
    admin: { label: "Admin Courtier", className: "bg-amber-500/20 text-amber-200 border-amber-500/30" },
    client: { label: "Client", className: "bg-blue-500/20 text-blue-200 border-blue-500/30" },
    prospect: { label: "Prospect", className: "bg-purple-500/20 text-purple-200 border-purple-500/30" },
    prescripteur: { label: "Prescripteur", className: "bg-green-500/20 text-green-200 border-green-500/30" },
    mandataire: { label: "Mandataire", className: "bg-orange-500/20 text-orange-200 border-orange-500/30" },
  };
  return map[role] ?? { label: role, className: "bg-white/10 text-white/70" };
}

interface EJLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function EJLayout({ children, title }: EJLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: unreadMessages } = trpc.messages.unreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });

  if (!user) return null;

  const navItems = getNavItems(user.role);
  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 flex flex-col
          transition-transform duration-300 ease-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "var(--color-brand-navy)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center px-6 py-6 border-b border-white/10">
          <img
            src={LOGO_URL}
            alt="EJ Partners Assurances"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
              style={{ background: "var(--color-brand-gold)", color: "var(--color-brand-navy)" }}
            >
              {user.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user.name ?? "Utilisateur"}</p>
              <Badge
                variant="outline"
                className={`text-xs mt-0.5 border ${roleBadge.className}`}
              >
                {roleBadge.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group
                  ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={isActive ? "text-white" : "text-white/60 group-hover:text-white/90"}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.href.includes("messagerie") && (unreadMessages ?? 0) > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
                {isActive && <ChevronRight size={14} className="text-white/50" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Separator className="bg-white/10 mb-3" />
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all duration-150"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-border flex-shrink-0 shadow-sm">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Page title */}
          <div className="flex items-center gap-2">
            {user.role === "admin" && <Shield size={18} className="text-brand-navy" />}
            <h1 className="text-lg font-semibold text-foreground font-sans">
              {title ?? "EJ Partners Assurances"}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/${user.role === "admin" ? "admin" : (user.role === "prospect" ? "client" : user.role)}/notifications`}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Bell size={20} className="text-muted-foreground" />
              {(unreadCount ?? 0) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
