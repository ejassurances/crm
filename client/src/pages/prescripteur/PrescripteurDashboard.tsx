import { useAuth } from "@/_core/hooks/useAuth";
import EJLayout from "@/components/EJLayout";
import MessagerieChat from "@/components/MessagerieChat";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Network, Plus, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PrescripteurDashboard() {
  const { user } = useAuth();
  const [openApport, setOpenApport] = useState(false);
  const [form, setForm] = useState({ clientNom: "", clientEmail: "", clientPhone: "", notes: "" });

  const utils = trpc.useUtils();
  const { data: apports = [], isLoading } = trpc.prescripteur.mesApports.useQuery();
  const { data: stats } = trpc.prescripteur.stats.useQuery();
  const { data: adminUser } = trpc.common.adminContact.useQuery();

  const soumettreApport = trpc.prescripteur.soumettre.useMutation({
    onSuccess: () => {
      toast.success("Apport soumis avec succès !");
      utils.prescripteur.mesApports.invalidate();
      utils.prescripteur.stats.invalidate();
      setOpenApport(false);
      setForm({ clientNom: "", clientEmail: "", clientPhone: "", notes: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <EJLayout title="Espace Prescripteur">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--color-brand-navy) 0%, oklch(30% 0.08 160) 100%)" }}
        >
          <h2 className="text-xl font-bold font-serif">
            Bonjour, {user?.name?.split(" ")[0] ?? ""}
          </h2>
          <p className="text-white/70 text-sm mt-1">Votre espace prescripteur EJ Partners Assurances</p>
          {stats && (
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-white/60">Apport(s)</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.tauxConversion}%</p>
                <p className="text-xs text-white/60">Taux conversion</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.commissionTotale} €</p>
                <p className="text-xs text-white/60">Commissions</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total apports" value={stats.total} icon={<Network size={18} />} color="navy" />
            <StatCard label="Convertis" value={stats.convertis} icon={<TrendingUp size={18} />} color="green" />
            <StatCard label="En cours" value={stats.enCours} icon={<Users size={18} />} color="blue" />
            <StatCard label="Perdus" value={stats.perdus} icon={<Network size={18} />} color="orange" />
          </div>
        )}

        <Tabs defaultValue="apports">
          <div className="flex items-center justify-between mb-3">
            <TabsList>
              <TabsTrigger value="apports" className="gap-2">
                <Network size={14} />
                Mes apports
              </TabsTrigger>
              <TabsTrigger value="messagerie" className="gap-2">
                <MessageSquare size={14} />
                Messagerie
              </TabsTrigger>
            </TabsList>

            <Dialog open={openApport} onOpenChange={setOpenApport}>
              <DialogTrigger asChild>
                <Button style={{ background: "var(--color-brand-navy)" }} className="text-white gap-2" size="sm">
                  <Plus size={15} />
                  Soumettre un apport
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Soumettre un apport d'affaires</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label>Nom du client <span className="text-red-500">*</span></Label>
                    <Input
                      value={form.clientNom}
                      onChange={(e) => setForm((f) => ({ ...f, clientNom: e.target.value }))}
                      placeholder="Prénom Nom"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email du client</Label>
                    <Input
                      type="email"
                      value={form.clientEmail}
                      onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
                      placeholder="email@exemple.fr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Téléphone du client</Label>
                    <Input
                      value={form.clientPhone}
                      onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
                      placeholder="06 XX XX XX XX"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notes / Contexte</Label>
                    <Input
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Besoin en assurance, contexte..."
                    />
                  </div>
                  <Button
                    className="w-full text-white"
                    style={{ background: "var(--color-brand-navy)" }}
                    disabled={!form.clientNom || soumettreApport.isPending}
                    onClick={() =>
                      soumettreApport.mutate({
                        clientNom: form.clientNom,
                        clientEmail: form.clientEmail || undefined,
                        clientPhone: form.clientPhone || undefined,
                        notes: form.notes || undefined,
                      })
                    }
                  >
                    {soumettreApport.isPending ? "Envoi..." : "Soumettre l'apport"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="apports">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 text-sm text-muted-foreground">Chargement...</div>
                ) : apports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                    <Network size={40} className="opacity-30" />
                    <p className="text-sm">Aucun apport soumis</p>
                    <p className="text-xs">Cliquez sur "Soumettre un apport" pour commencer</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Client</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apports.map((a) => (
                        <TableRow key={a.id} className="hover:bg-muted/20">
                          <TableCell className="font-medium">{a.clientNom}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {a.clientEmail ?? a.clientPhone ?? "—"}
                          </TableCell>
                          <TableCell><StatusBadge value={a.statut} variant="apport" /></TableCell>
                          <TableCell className="text-sm">
                            {a.commission ? `${a.commission} €` : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messagerie">
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
