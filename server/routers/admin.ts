import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  createInvitation,
  createNotification,
  getAllApports,
  getAllDossiers,
  getAllInvitations,
  getAllUsers,
  getAdminKPIs,
  getUserById,
  getUsersByRole,
  updateUser,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";

// Middleware admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin")
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé à l'admin courtier" });
  return next({ ctx });
});

export const adminRouter = router({
  // KPIs tableau de bord
  kpis: adminProcedure.query(async () => {
    return getAdminKPIs();
  }),

  // Liste de tous les utilisateurs
  users: adminProcedure.query(async () => {
    return getAllUsers();
  }),

  // Utilisateurs par rôle
  usersByRole: adminProcedure
    .input(z.object({ role: z.enum(["client", "prospect", "prescripteur", "mandataire"]) }))
    .query(async ({ input }) => {
      return getUsersByRole(input.role);
    }),

  // Détail d'un utilisateur
  userById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const user = await getUserById(input.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return user;
    }),

  // Modifier le rôle ou les infos d'un utilisateur
  updateUser: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.enum(["client", "prospect", "prescripteur", "mandataire"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateUser(id, data as any);
      return { success: true };
    }),

  // Créer une invitation
  createInvitation: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["client", "prospect", "prescripteur", "mandataire"]),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

      await createInvitation({
        email: input.email,
        role: input.role,
        token,
        createdByAdminId: ctx.user.id,
        expiresAt,
      });

      const inviteUrl = `${input.origin}/invitation?token=${token}`;

      // Notifier l'admin de la création
      await notifyOwner({
        title: `📧 Invitation créée`,
        content: `Une invitation a été créée pour ${input.email} (rôle : ${input.role}).\nLien : ${inviteUrl}`,
      });

      return { success: true, inviteUrl, token };
    }),

  // Liste des invitations
  invitations: adminProcedure.query(async () => {
    return getAllInvitations();
  }),

  // Tous les dossiers
  allDossiers: adminProcedure.query(async () => {
    return getAllDossiers();
  }),

  // Tous les apports
  allApports: adminProcedure.query(async () => {
    return getAllApports();
  }),

  // Statistiques par type de dossier
  dossierStats: adminProcedure.query(async () => {
    const dossiers = await getAllDossiers();
    const byStatut = dossiers.reduce(
      (acc, d) => {
        acc[d.statut] = (acc[d.statut] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const byType = dossiers.reduce(
      (acc, d) => {
        acc[d.type] = (acc[d.type] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return { byStatut, byType, total: dossiers.length };
  }),
});
