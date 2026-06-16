import EJLayout from "@/components/EJLayout";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { FolderOpen, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function AdminDossiers() {
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    titre: "",
    type: "autre" as const,
    statut: "prospect" as const,
    description: "",
  });

  const utils = trpc.useUtils();
  const { data: dossiers = [], isLoading } = trpc.admin.allDossiers.useQuery();
  const { data: clients = [] } = trpc.admin.usersByRole.useQuery({ role: "client" });
  const { data: prospects = [] } = trpc.admin.usersByRole.useQuery({ role: "prospect" });
  const allClients = [...clients, ...prospects];

  const createMutation = trpc.dossiers.create.useMutation({
    onSuccess: () => {
      toast.success("Dossier créé avec succès");
      utils.admin.allDossiers.invalidate();
      utils.admin.kpis.invalidate();
      setOpenCreate(false);
      setForm({ clientId: "", titre: "", type: "autre", statut: "prospect", description: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const filtered = dossiers.filter((d) => {
    const matchSearch =
      !search || d.titre.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "tous" || d.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  return (
    <EJLayout title="Gestion des dossiers">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif">Dossiers</h2>
            <p className="text-muted-foreground text-sm mt-1">{dossiers.length} dossier(s) au total</p>
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button style={{ background: "var(--color-brand-navy)" }} className="text-white gap-2">
                <Plus size={16} />
                Nouveau dossier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un dossier</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Client / Prospect</Label>
                  <Select value={form.clientId} onValueChange={(v) => setForm((f) => ({ ...f, clientId: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {allClients.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name ?? c.email ?? `#${c.id}`} ({c.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Titre du dossier</Label>
                  <Input
                    value={form.titre}
                    onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
                    placeholder="Ex: Assurance habitation principale"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assurance_vie">Assurance Vie</SelectItem>
                        <SelectItem value="assurance_habitation">Habitation</SelectItem>
                        <SelectItem value="assurance_auto">Auto</SelectItem>
                        <SelectItem value="assurance_sante">Santé</SelectItem>
                        <SelectItem value="prevoyance">Prévoyance</SelectItem>
                        <SelectItem value="retraite">Retraite</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Statut</Label>
                    <Select value={form.statut} onValueChange={(v) => setForm((f) => ({ ...f, statut: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="devis_envoye">Devis envoyé</SelectItem>
                        <SelectItem value="en_attente_documents">Docs attendus</SelectItem>
                        <SelectItem value="contrat_signe">Contrat signé</SelectItem>
                        <SelectItem value="actif">Actif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description (optionnel)</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Notes ou détails..."
                  />
                </div>
                <Button
                  className="w-full text-white"
                  style={{ background: "var(--color-brand-navy)" }}
                  disabled={!form.clientId || !form.titre || createMutation.isPending}
                  onClick={() =>
                    createMutation.mutate({
                      clientId: parseInt(form.clientId),
                      titre: form.titre,
                      type: form.type,
                      statut: form.statut,
                      description: form.description || undefined,
                    })
                  }
                >
                  {createMutation.isPending ? "Création..." : "Créer le dossier"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtres */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un dossier..."
                  className="pl-9"
                />
              </div>
              <Select value={filterStatut} onValueChange={setFilterStatut}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
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
            </div>
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <FolderOpen size={40} className="opacity-30" />
                <p className="text-sm">Aucun dossier trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{d.titre}</TableCell>
                      <TableCell><StatusBadge value={d.type} variant="type" /></TableCell>
                      <TableCell><StatusBadge value={d.statut} /></TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/dossiers/${d.id}`}>
                          <Button variant="ghost" size="sm">Voir</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </EJLayout>
  );
}
