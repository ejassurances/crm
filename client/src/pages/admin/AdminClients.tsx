import EJLayout from "@/components/EJLayout";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Copy, Mail, Plus, Search, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminClients() {
  const [search, setSearch] = useState("");
  const [openInvite, setOpenInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "client" as const });
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const { data: users = [], isLoading } = trpc.admin.users.useQuery();

  const inviteMutation = trpc.admin.createInvitation.useMutation({
    onSuccess: (data) => {
      setInviteLink(data.inviteUrl);
      toast.success("Invitation créée !");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Compte mis à jour");
    },
    onError: (err) => toast.error(err.message),
  });

  const filterUsers = (role: string) =>
    users
      .filter((u) => u.role !== "admin")
      .filter((u) => role === "tous" || u.role === role)
      .filter(
        (u) =>
          !search ||
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      );

  const UserTable = ({ role }: { role: string }) => {
    const filtered = filterUsers(role);
    return filtered.length === 0 ? (
      <div className="text-center py-10 text-muted-foreground text-sm">Aucun compte trouvé</div>
    ) : (
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Inscrit le</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((u) => (
            <TableRow key={u.id} className="hover:bg-muted/20">
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ background: "var(--color-brand-navy)", color: "white" }}
                  >
                    {(u.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">{u.name ?? "—"}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{u.email ?? "—"}</TableCell>
              <TableCell><StatusBadge value={u.role} variant="role" /></TableCell>
              <TableCell>
                <span className={`text-xs font-medium ${u.isActive ? "text-emerald-600" : "text-red-500"}`}>
                  {u.isActive ? "Actif" : "Inactif"}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(u.createdAt).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateUserMutation.mutate({ id: u.id, isActive: !u.isActive })
                  }
                >
                  {u.isActive ? "Désactiver" : "Activer"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <EJLayout title="Gestion des comptes">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif">Comptes</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {users.filter((u) => u.role !== "admin").length} compte(s) au total
            </p>
          </div>
          <Dialog open={openInvite} onOpenChange={(o) => { setOpenInvite(o); if (!o) setInviteLink(null); }}>
            <DialogTrigger asChild>
              <Button style={{ background: "var(--color-brand-navy)" }} className="text-white gap-2">
                <Plus size={16} />
                Inviter un compte
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une invitation</DialogTitle>
              </DialogHeader>
              {inviteLink ? (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm font-medium text-emerald-800 mb-2 flex items-center gap-2">
                      <UserCheck size={16} />
                      Invitation créée avec succès
                    </p>
                    <p className="text-xs text-emerald-700 break-all">{inviteLink}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLink);
                      toast.success("Lien copié !");
                    }}
                  >
                    <Copy size={14} />
                    Copier le lien
                  </Button>
                  <Button
                    className="w-full text-white"
                    style={{ background: "var(--color-brand-navy)" }}
                    onClick={() => { setInviteLink(null); setInviteForm({ email: "", role: "client" }); }}
                  >
                    Nouvelle invitation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label>Adresse email</Label>
                    <Input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="email@exemple.fr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Rôle</Label>
                    <Select
                      value={inviteForm.role}
                      onValueChange={(v) => setInviteForm((f) => ({ ...f, role: v as any }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="prescripteur">Prescripteur</SelectItem>
                        <SelectItem value="mandataire">Mandataire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full text-white gap-2"
                    style={{ background: "var(--color-brand-navy)" }}
                    disabled={!inviteForm.email || inviteMutation.isPending}
                    onClick={() =>
                      inviteMutation.mutate({
                        email: inviteForm.email,
                        role: inviteForm.role,
                        origin: window.location.origin,
                      })
                    }
                  >
                    <Mail size={16} />
                    {inviteMutation.isPending ? "Création..." : "Créer l'invitation"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Recherche */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou email..."
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Onglets par rôle */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : (
              <Tabs defaultValue="tous">
                <div className="px-4 pt-4">
                  <TabsList>
                    <TabsTrigger value="tous">Tous</TabsTrigger>
                    <TabsTrigger value="client">Clients</TabsTrigger>
                    <TabsTrigger value="prospect">Prospects</TabsTrigger>
                    <TabsTrigger value="prescripteur">Prescripteurs</TabsTrigger>
                    <TabsTrigger value="mandataire">Mandataires</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="tous" className="mt-0"><UserTable role="tous" /></TabsContent>
                <TabsContent value="client" className="mt-0"><UserTable role="client" /></TabsContent>
                <TabsContent value="prospect" className="mt-0"><UserTable role="prospect" /></TabsContent>
                <TabsContent value="prescripteur" className="mt-0"><UserTable role="prescripteur" /></TabsContent>
                <TabsContent value="mandataire" className="mt-0"><UserTable role="mandataire" /></TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </EJLayout>
  );
}
