import EJLayout from "@/components/EJLayout";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  BriefcaseBusiness,
  FileCheck,
  FolderOpen,
  Network,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: kpis, isLoading: kpisLoading } = trpc.admin.kpis.useQuery();
  const { data: dossiers = [], isLoading: dossiersLoading } = trpc.admin.allDossiers.useQuery();
  const { data: users = [] } = trpc.admin.users.useQuery();

  const recentDossiers = dossiers.slice(0, 5);
  const recentUsers = users.filter((u) => u.role !== "admin").slice(0, 5);

  return (
    <EJLayout title="Tableau de bord">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif text-foreground">Vue d'ensemble</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link href="/admin/dossiers/nouveau">
            <Button style={{ background: "var(--color-brand-navy)" }} className="text-white gap-2">
              <FolderOpen size={16} />
              Nouveau dossier
            </Button>
          </Link>
        </div>

        {/* KPIs */}
        {kpisLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Dossiers actifs"
                value={kpis?.dossiersActifs ?? 0}
                icon={<FolderOpen size={20} />}
                color="navy"
              />
              <StatCard
                label="Contrats signés"
                value={kpis?.contratsSigns ?? 0}
                icon={<FileCheck size={20} />}
                color="green"
              />
              <StatCard
                label="Prospects"
                value={kpis?.prospects ?? 0}
                icon={<Users size={20} />}
                color="blue"
              />
              <StatCard
                label="Total dossiers"
                value={kpis?.totalDossiers ?? 0}
                icon={<FolderOpen size={20} />}
                color="purple"
              />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Clients"
                value={kpis?.totalClients ?? 0}
                icon={<Users size={20} />}
                color="gold"
              />
              <StatCard
                label="Prescripteurs"
                value={kpis?.totalPrescripteurs ?? 0}
                icon={<Network size={20} />}
                color="green"
              />
              <StatCard
                label="Mandataires"
                value={kpis?.totalMandataires ?? 0}
                icon={<BriefcaseBusiness size={20} />}
                color="orange"
              />
              <StatCard
                label="Taux conversion"
                value={`${kpis?.tauxConversion ?? 0}%`}
                icon={<TrendingUp size={20} />}
                color="navy"
              />
            </div>
          </>
        )}

        {/* Tableaux récents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dossiers récents */}
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Dossiers récents</CardTitle>
              <Link href="/admin/dossiers">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                  Voir tout →
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {dossiersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              ) : recentDossiers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aucun dossier</p>
              ) : (
                <div className="space-y-2">
                  {recentDossiers.map((d) => (
                    <Link key={d.id} href={`/admin/dossiers/${d.id}`}>
                      <a className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{d.titre}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <StatusBadge value={d.statut} />
                      </a>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Utilisateurs récents */}
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Comptes récents</CardTitle>
              <Link href="/admin/clients">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                  Voir tout →
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aucun compte</p>
              ) : (
                <div className="space-y-2">
                  {recentUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ background: "var(--color-brand-navy)", color: "white" }}
                      >
                        {(u.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{u.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email ?? "—"}</p>
                      </div>
                      <StatusBadge value={u.role} variant="role" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </EJLayout>
  );
}
