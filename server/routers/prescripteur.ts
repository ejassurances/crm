import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createApport,
  getApportsByPrescripteurId,
  updateApport,
  getAllUsers,
  createNotification,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";

const prescripteurProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "prescripteur" && ctx.user.role !== "admin")
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux prescripteurs" });
  return next({ ctx });
});

export const prescripteurRouter = router({
  // Liste des apports du prescripteur connecté
  mesApports: prescripteurProcedure.query(async ({ ctx }) => {
    const id = ctx.user.role === "admin" ? undefined : ctx.user.id;
    if (!id) return [];
    return getApportsByPrescripteurId(id);
  }),

  // Statistiques
  stats: prescripteurProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === "admin") return null;
    const apports = await getApportsByPrescripteurId(ctx.user.id);
    const total = apports.length;
    const convertis = apports.filter((a) => a.statut === "converti").length;
    const enCours = apports.filter((a) => a.statut === "en_cours" || a.statut === "contacte").length;
    const perdus = apports.filter((a) => a.statut === "perdu").length;
    const tauxConversion = total > 0 ? Math.round((convertis / total) * 100) : 0;
    const commissionTotale = apports
      .filter((a) => a.commission !== null)
      .reduce((sum, a) => sum + parseFloat(a.commission ?? "0"), 0);

    return {
      total,
      convertis,
      enCours,
      perdus,
      tauxConversion,
      commissionTotale: commissionTotale.toFixed(2),
    };
  }),

  // Soumettre un nouvel apport
  soumettre: prescripteurProcedure
    .input(
      z.object({
        clientNom: z.string().min(1),
        clientEmail: z.string().email().optional(),
        clientPhone: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role === "admin")
        throw new TRPCError({ code: "FORBIDDEN", message: "L'admin ne peut pas soumettre d'apport" });

      await createApport({
        prescripteurId: ctx.user.id,
        clientNom: input.clientNom,
        clientEmail: input.clientEmail ?? null,
        clientPhone: input.clientPhone ?? null,
        notes: input.notes ?? null,
      });

      // Alerter l'admin
      await notifyOwner({
        title: `🤝 Nouvelle demande d'apport`,
        content: `${ctx.user.name ?? "Un prescripteur"} a soumis un apport pour : ${input.clientNom}${input.clientEmail ? ` (${input.clientEmail})` : ""}.`,
      });

      // Notification interne
      const admins = (await getAllUsers()).filter((u) => u.role === "admin");
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          titre: "Nouvelle demande d'apport",
          contenu: `${ctx.user.name ?? "Un prescripteur"} a soumis un apport pour ${input.clientNom}.`,
          type: "nouvelle_demande",
        });
      }

      return { success: true };
    }),
});
