import EJLayout from "@/components/EJLayout";
import MessagerieChat from "@/components/MessagerieChat";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

export default function AdminMessagerie() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  const { data: conversations = [], isLoading } = trpc.messages.adminConversations.useQuery(
    undefined,
    { refetchInterval: 15000 }
  );

  const selectedConv = conversations.find((c) => c.userId === selectedUserId);

  return (
    <EJLayout title="Messagerie">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-serif">Messagerie</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Conversations avec vos clients, prescripteurs et mandataires
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          {/* Liste des conversations */}
          <Card className="shadow-sm overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                <p className="text-sm font-semibold">Conversations ({conversations.length})</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-sm text-muted-foreground">Chargement...</div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 p-6">
                    <MessageSquare size={32} className="opacity-30" />
                    <p className="text-sm text-center">Aucune conversation</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.userId}
                      onClick={() => {
                        setSelectedUserId(conv.userId);
                        setSelectedUserName(conv.userName ?? `Utilisateur #${conv.userId}`);
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors ${
                        selectedUserId === conv.userId ? "bg-muted/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5"
                          style={{ background: "var(--color-brand-navy)", color: "white" }}
                        >
                          {(conv.userName ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold truncate">{conv.userName ?? `#${conv.userId}`}</p>
                            {conv.unread > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StatusBadge value={conv.userRole} variant="role" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{conv.lastMessage}</p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5">
                            {new Date(conv.lastAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Zone de chat */}
          <div className="lg:col-span-2">
            {selectedUserId ? (
              <MessagerieChat
                withUserId={selectedUserId}
                withUserName={selectedUserName}
              />
            ) : (
              <Card className="h-full shadow-sm">
                <CardContent className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <MessageSquare size={40} className="opacity-20" />
                  <p className="text-sm">Sélectionnez une conversation</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </EJLayout>
  );
}
