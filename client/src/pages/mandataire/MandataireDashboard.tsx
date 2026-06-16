import { useAuth } from "@/_core/hooks/useAuth";
import DocumentUpload from "@/components/DocumentUpload";
import EJLayout from "@/components/EJLayout";
import MessagerieChat from "@/components/MessagerieChat";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  BriefcaseBusiness,
  FileText,
  FolderOpen,
  MessageSquare,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";

export default function MandataireDashboard() {
  const { user } = useAuth();
  const [selectedDossierId, setSelectedDossierId] = useState<number | null>(null);

  const { data: dossiers = [], isLoading: dossiersLoading } = trpc.mandataire.mesDossiers.useQuery();
  const { data: portefeuille = [] } = trpc.mandataire.portefeuille.useQuery();
  const { data: stats } = trpc.mandataire.stats.useQuery();
  const { data: adminUser } = trpc.common.adminContact.useQuery();

  const selectedDossier = selectedDossierId
    ? dossiers.find((d) => d.id === selectedDossierId)
    : null;

  return (
    <EJLayout title="Espace Mandataire">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--color-brand-navy) 0%, oklch(30% 0.08 30) 100%)" }}
        >
          <h2 className="text-xl font-bold font-serif">
            Bonjour, {user?.name?.split(" ")[0] ?? ""}
          </h2>
          <p className="text-white/70 text-sm mt-1">Votre espace mandataire EJ Partners Assurances</p>
          {stats && (
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.totalDossiers}</p>
                <p className="text-xs text-white/60">Dossier(s)</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.totalClients}</p>
                <p className="text-xs text-white/60">Client(s)</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.dossiersActifs}</p>
                <p className="text-xs text-white/60">Actif(s)</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total dossiers" value={stats.totalDossiers} icon={<FolderOpen size={18} />} color="navy" />
            <StatCard label="Actifs" value={stats.dossiersActifs} icon={<BriefcaseBusiness size={18} />} color="green" />
            <StatCard label="Contrats signés" value={stats.contratsSigns} icon={<FileText size={18} />} color="blue" />
            <StatCard label="Clients" value={stats.totalClients} icon={<Users size={18} />} color="gold" />
          </div>
        )}

        <Tabs defaultValue="dossiers">
          <TabsList>
            <TabsTrigger value="dossiers" className="gap-2">
              <FolderOpen size={14} />
              Mes dossiers
            </TabsTrigger>
            <TabsTrigger value="portefeuille" className="gap-2">
              <Wallet size={14} />
              Portefeuille
            </TabsTrigger>
            <TabsTrigger value="messagerie" className="gap-2">
              <MessageSquare size={14} />
              Messagerie
            </TabsTrigger>
          </TabsList>

          {/* Dossiers */}
          <TabsContent value="dossiers" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Liste */}
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Dossiers assignés</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {dossiersLoading ? (
                    <div className="p-4 text-sm text-muted-foreground">Chargement...</div>
                  ) : dossiers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2 px-4">
                      <FolderOpen size={32} className="opacity-30" />
                      <p className="text-sm text-center">Aucun dossier assigné</p>
                    </div>
                  ) : (
                    dossiers.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDossierId(d.id)}
                        className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors ${
                          selectedDossier?.id === d.id ? "bg-muted/50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{d.titre}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <StatusBadge value={d.statut} />
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Détail dossier */}
              <div className="lg:col-span-2">
                {selectedDossier ? (
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{selectedDossier.titre}</CardTitle>
                        <StatusBadge value={selectedDossier.statut} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <DocumentUpload dossierId={selectedDossier.id} canUpload={true} />
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-48 shadow-sm">
                    <CardContent className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Sélectionnez un dossier pour voir les documents
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Portefeuille */}
          <TabsContent value="portefeuille" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portefeuille.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                  <Users size={40} className="opacity-30" />
                  <p className="text-sm">Aucun client dans votre portefeuille</p>
                </div>
              ) : (
                portefeuille.map((client: any) => (
                  <Card key={client.id} className="shadow-sm card-hover">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                          style={{ background: "var(--color-brand-navy)", color: "white" }}
                        >
                          {(client.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{client.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{client.email ?? "—"}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {client.dossiers.map((d: any) => (
                          <div key={d.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground truncate max-w-[60%]">{d.titre}</span>
                            <StatusBadge value={d.statut} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Messagerie */}
          <TabsContent value="messagerie" className="mt-4">
            {adminUser ? (
              <MessagerieChat
                withUserId={adminUser.id}
                withUserName="EJ Partners Assurances"
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  Messagerie indisponible
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </EJLayout>
  );
}
