import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface MessagérieChatProps {
  withUserId: number;
  withUserName?: string;
}

export default function MessagerieChat({ withUserId, withUserName }: MessagérieChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: messages = [], isLoading } = trpc.messages.conversation.useQuery(
    { withUserId },
    { refetchInterval: 10000 }
  );

  const markRead = trpc.messages.markRead.useMutation();
  const sendMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessage("");
      utils.messages.conversation.invalidate({ withUserId });
      utils.messages.unreadCount.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // Marquer comme lu à l'ouverture
  useEffect(() => {
    markRead.mutate({ fromUserId: withUserId });
  }, [withUserId]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendMutation.mutate({ receiverId: withUserId, contenu: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[400px] bg-white rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{ background: "var(--color-brand-navy)", color: "white" }}
        >
          {(withUserName ?? "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{withUserName ?? "Interlocuteur"}</p>
          <p className="text-xs text-muted-foreground">Messagerie sécurisée</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Chargement...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
            <Send size={24} className="opacity-30" />
            <p>Aucun message. Commencez la conversation.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={cn("flex", isMe ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                      isMe
                        ? "rounded-br-sm text-white"
                        : "rounded-bl-sm bg-muted text-foreground"
                    )}
                    style={isMe ? { background: "var(--color-brand-navy)" } : {}}
                  >
                    <p className="leading-relaxed">{msg.contenu}</p>
                    <p className={cn("text-xs mt-1 opacity-60", isMe ? "text-right" : "text-left")}>
                      {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border bg-muted/20">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-white"
            maxLength={2000}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
            size="icon"
            style={{ background: "var(--color-brand-navy)" }}
            className="text-white hover:opacity-90 flex-shrink-0"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
