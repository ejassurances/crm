import { z } from "zod";
import {
  getNotificationsByUserId,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const notificationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getNotificationsByUserId(ctx.user.id);
  }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return getUnreadNotificationCount(ctx.user.id);
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await markNotificationAsRead(input.id);
      return { success: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await markAllNotificationsAsRead(ctx.user.id);
    return { success: true };
  }),
});
