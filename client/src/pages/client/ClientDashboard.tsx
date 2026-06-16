import { useAuth } from "@/_core/hooks/useAuth";
import DocumentUpload from "@/components/DocumentUpload";
import EJLayout from "@/components/EJLayout";
import MessagerieChat from "@/components/MessagerieChat";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { FileText, FolderOpen, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [selectedDossierId, setSelectedDossierId] = useState<number | null>(null);

  const { data: dossiers = [], isLoading } = trpc.dossiers.list.useQuery();
  const { data: adminUser } = trpc.common.adminContact.useQuery();

  const activeDossiers = dossiers.filter((d) => d.statut === "actif" || d.statut === "en_cours");
  const selectedDossier = selectedDossierId
    ? dossiers.find((d) => d.id === selectedDossierId)
    : dossiers[0];

  return (
    <EJLayout title="Mon espace">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Bienvenue */}
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--color-brand-navy) 0%, var(--color-brand-navy-light) 100%)" }}
        >
          <h2 className="text-xl font-bold font-serif">
            Bonjour, {user?.name?.split(" ")[0] ?? ""}
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Bienvenue sur votre espace personnel EJ Partners Assurances
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{dossiers.length}</p>
              <p className="text-xs text-white/60">Dossier(s)</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">{activeDossiers.length}</p>
              <p className="text-xs text-white/60">Actif(s)</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Dossiers"
            value={dossiers.length}
            icon={<FolderOpen size={18} />}
            color="navy"
          />
          <StatCard
            label="Actifs"
            value={activeDossiers.length}
            icon={<FileText size={18} />}
            color="green"
          />
          <StatCard
            label="Contrats signés"
            value={dossiers.filter((d) => d.statut === "contrat_signe").length}
            icon={<FileText size={18} />}
            color="blue"
          />
          <StatCard
            label="En attente"
            value={dossiers.filter((d) => d.statut === "en_attente_documents").length}
            icon={<MessageSquare size={18} />}
            color="orange"
          />
        </div>

        {/* Dossiers */}
        {dossiers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste dossiers */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Mes dossiers</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {dossiers.map((d) => (
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
                ))}
              </CardContent>
            </Card>

            {/* Détail dossier sélectionné */}
            <div className="lg:col-span-2">
              {selectedDossier ? (
                <Tabs defaultValue="documents">
                  <div className="mb-3">
                    <h3 className="font-semibold text-foreground">{selectedDossier.titre}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge value={selectedDossier.statut} />
                      <StatusBadge value={selectedDossier.type} variant="type" />
                    </div>
                  </div>
                  <TabsList className="w-full">
                    <TabsTrigger value="documents" className="flex-1 gap-2">
                      <FileText size={14} />
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="messagerie" className="flex-1 gap-2">
                      <MessageSquare size={14} />
                      Messagerie
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="documents" className="mt-4">
                    <Card>
                      <CardContent className="pt-5">
                        <DocumentUpload dossierId={selectedDossier.id} canUpload={true} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="messagerie" className="mt-4">
                    {adminUser ? (
                      <MessagerieChat
                        withUserId={adminUser.id}
                        withUserName="EJ Partners Assurances"
                      />
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground text-sm">
                          Contactez votre courtier
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <Card className="h-full">
                  <CardContent className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Sélectionnez un dossier
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Aucun dossier */}
        {!isLoading && dossiers.length === 0 && (
          <Card className="shadow-sm">
            <CardContent className="py-12 text-center">
              <FolderOpen size={40} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">Aucun dossier pour le moment</p>
              <p className="text-xs text-muted-foreground mt-1">
                Votre courtier créera votre dossier prochainement.
              </p>
              {adminUser && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Vous pouvez contacter votre courtier :</p>
                  <MessagerieChat
                    withUserId={adminUser.id}
                    withUserName="EJ Partners Assurances"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </EJLayout>
  );
}
