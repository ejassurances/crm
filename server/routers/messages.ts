import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createMessage,
  createNotification,
  getAllConversationsForAdmin,
  getConversation,
  getUnreadMessageCount,
  getUserById,
  getAllUsers,
  markMessagesAsRead,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";

export const messagesRouter = router({
  // Conversation entre l'utilisateur courant et un autre
  conversation: protectedProcedure
    .input(z.object({ withUserId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      // Vérification : on ne peut voir que ses propres conversations
      // L'admin peut voir toutes les conversations
      if (user.role !== "admin") {
        // Les non-admin ne peuvent converser qu'avec l'admin
        const targetUser = await getUserById(input.withUserId);
        if (!targetUser || targetUser.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN", message: "Vous ne pouvez converser qu'avec l'admin courtier" });
      }
      return getConversation(user.id, input.withUserId);
    }),

  // Toutes les conversations de l'admin
  adminConversations: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin")
      throw new TRPCError({ code: "FORBIDDEN" });

    const allMessages = await getAllConversationsForAdmin(ctx.user.id);
    const allUsers = await getAllUsers();

    // Grouper par interlocuteur
    const conversationMap = new Map<number, {
      userId: number;
      userName: string | null;
      userRole: string;
      lastMessage: string;
      lastAt: Date;
      unread: number;
    }>();

    for (const msg of allMessages) {
      const otherId = msg.senderId === ctx.user.id ? msg.receiverId : msg.senderId;
      const otherUser = allUsers.find((u) => u.id === otherId);
      if (!otherUser) continue;

      const existing = conversationMap.get(otherId);
      if (!existing || msg.createdAt > existing.lastAt) {
        conversationMap.set(otherId, {
          userId: otherId,
          userName: otherUser.name,
          userRole: otherUser.role,
          lastMessage: msg.contenu.substring(0, 80),
          lastAt: msg.createdAt,
          unread: existing?.unread ?? 0,
        });
      }
      // Compter les non-lus (messages reçus par l'admin)
      if (msg.receiverId === ctx.user.id && !msg.lu) {
        const conv = conversationMap.get(otherId)!;
        conv.unread += 1;
      }
    }

    return Array.from(conversationMap.values()).sort(
      (a, b) => b.lastAt.getTime() - a.lastAt.getTime()
    );
  }),

  // Envoyer un message
  send: protectedProcedure
    .input(
      z.object({
        receiverId: z.number(),
        contenu: z.string().min(1).max(2000),
        dossierId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      // Les non-admin ne peuvent envoyer qu'à l'admin
      if (user.role !== "admin") {
        const receiver = await getUserById(input.receiverId);
        if (!receiver || receiver.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN", message: "Vous ne pouvez envoyer des messages qu'à l'admin courtier" });
      }

      await createMessage({
        senderId: user.id,
        receiverId: input.receiverId,
        contenu: input.contenu,
        dossierId: input.dossierId ?? null,
      });

      // Notification au destinataire
      await createNotification({
        userId: input.receiverId,
        titre: "Nouveau message",
        contenu: `${user.name ?? "Quelqu'un"} vous a envoyé un message.`,
        type: "nouveau_message",
        lienId: user.id,
      });

      // Alerte email si le message vient d'un non-admin
      if (user.role !== "admin") {
        const roleLabels: Record<string, string> = {
          client: "Client",
          prospect: "Prospect",
          prescripteur: "Prescripteur",
          mandataire: "Mandataire",
        };
        await notifyOwner({
          title: `💬 Nouveau message de ${roleLabels[user.role] ?? user.role}`,
          content: `${user.name ?? "Un utilisateur"} (${roleLabels[user.role] ?? user.role}) vous a envoyé un message :\n\n"${input.contenu.substring(0, 200)}${input.contenu.length > 200 ? "..." : ""}"`,
        });
      }

      return { success: true };
    }),

  // Marquer une conversation comme lue
  markRead: protectedProcedure
    .input(z.object({ fromUserId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await markMessagesAsRead(ctx.user.id, input.fromUserId);
      return { success: true };
    }),

  // Nombre de messages non lus
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return getUnreadMessageCount(ctx.user.id);
  }),
});
