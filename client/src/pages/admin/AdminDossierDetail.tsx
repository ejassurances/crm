import DocumentUpload from "@/components/DocumentUpload";
import EJLayout from "@/components/EJLayout";
import MessagerieChat from "@/components/MessagerieChat";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, FileText, MessageSquare, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";

export default function AdminDossierDetail() {
  const { id } = useParams<{ id: string }>();
  const dossierId = parseInt(id ?? "0");
  const utils = trpc.useUtils();

  const { data: dossier, isLoading } = trpc.dossiers.byId.useQuery({ id: dossierId });
  const { data: client } = trpc.admin.userById.useQuery(
    { id: dossier?.clientId ?? 0 },
    { enabled: !!dossier?.clientId }
  );

  const updateMutation = trpc.dossiers.update.useMutation({
    onSuccess: () => {
      toast.success("Dossier mis à jour");
      utils.dossiers.byId.invalidate({ id: dossierId });
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <EJLayout title="Dossier">
        <div className="flex items-center justify-center h-64 text-muted-foreground">Chargement...</div>
      </EJLayout>
    );
  }

  if (!dossier) {
    return (
      <EJLayout title="Dossier introuvable">
        <div className="text-center py-16">
          <p className="text-muted-foreground">Ce dossier n'existe pas.</p>
          <Link href="/admin/dossiers">
            <Button variant="outline" className="mt-4">Retour aux dossiers</Button>
          </Link>
        </div>
      </EJLayout>
    );
  }

  return (
    <EJLayout title={dossier.titre}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/dossiers">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <ArrowLeft size={16} />
              Retour
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold font-serif">{dossier.titre}</h2>
              <StatusBadge value={dossier.statut} />
              <StatusBadge value={dossier.type} variant="type" />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Client : {client?.name ?? `#${dossier.clientId}`} — Créé le{" "}
              {new Date(dossier.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="documents">
              <TabsList className="w-full">
                <TabsTrigger value="documents" className="flex-1 gap-2">
                  <FileText size={15} />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="messagerie" className="flex-1 gap-2">
                  <MessageSquare size={15} />
                  Messagerie
                </TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="mt-4">
                <Card>
                  <CardContent className="pt-5">
                    <DocumentUpload dossierId={dossierId} canUpload={true} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messagerie" className="mt-4">
                {client ? (
                  <MessagerieChat
                    withUserId={client.id}
                    withUserName={client.name ?? client.email ?? `Client #${client.id}`}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground text-sm">
                      Client introuvable
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-4">
            {/* Informations */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Settings size={15} />
                  Informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Client</p>
                  <p className="font-medium">{client?.name ?? `#${dossier.clientId}`}</p>
                  {client?.email && <p className="text-muted-foreground text-xs">{client.email}</p>}
                </div>
                {dossier.montantPrime && (
                  <div>
                    <p className="text-muted-foreground text-xs">Prime</p>
                    <p className="font-medium">{dossier.montantPrime} €/an</p>
                  </div>
                )}
                {dossier.dateEffet && (
                  <div>
                    <p className="text-muted-foreground text-xs">Date d'effet</p>
                    <p className="font-medium">{new Date(dossier.dateEffet).toLocaleDateString("fr-FR")}</p>
                  </div>
                )}
                {dossier.description && (
                  <div>
                    <p className="text-muted-foreground text-xs">Description</p>
                    <p className="text-foreground">{dossier.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Modifier le statut */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Modifier le statut</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={dossier.statut}
                  onValueChange={(v) =>
                    updateMutation.mutate({ id: dossierId, statut: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="devis_envoye">Devis envoyé</SelectItem>
                    <SelectItem value="en_attente_documents">Docs attendus</SelectItem>
                    <SelectItem value="contrat_signe">Contrat signé</SelectItem>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="resilie">Résilié</SelectItem>
                    <SelectItem value="archive">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EJLayout>
  );
}
