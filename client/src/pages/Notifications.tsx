import EJLayout from "@/components/EJLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, string> = {
  nouveau_message: "💬",
  nouveau_document: "📄",
  statut_dossier: "📋",
  nouvelle_demande: "🤝",
  invitation: "📧",
  autre: "🔔",
};

export default function Notifications() {
  const utils = trpc.useUtils();
  const { data: notifs = [], isLoading } = trpc.notifications.list.useQuery();

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
      toast.success("Toutes les notifications marquées comme lues");
    },
  });

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const unread = notifs.filter((n) => !n.lu).length;

  return (
    <EJLayout title="Notifications">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif">Notifications</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {unread > 0 ? `${unread} non lue(s)` : "Tout est à jour"}
            </p>
          </div>
          {unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck size={15} />
              Tout marquer lu
            </Button>
          )}
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-sm text-muted-foreground">Chargement...</div>
            ) : notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <BellOff size={40} className="opacity-30" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifs.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.lu && markRead.mutate({ id: n.id })}
                  className={`w-full text-left px-5 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors flex items-start gap-4 ${
                    !n.lu ? "bg-blue-50/50" : ""
                  }`}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">
                    {TYPE_ICONS[n.type] ?? "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${!n.lu ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.titre}
                      </p>
                      {!n.lu && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.contenu}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {new Date(n.createdAt).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </EJLayout>
  );
}
