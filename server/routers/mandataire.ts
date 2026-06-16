import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getDossiersByMandataireId,
  getAllUsers,
  getUserById,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const mandataireProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "mandataire" && ctx.user.role !== "admin")
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux mandataires" });
  return next({ ctx });
});

export const mandataireRouter = router({
  // Dossiers du mandataire connecté
  mesDossiers: mandataireProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === "admin") return [];
    return getDossiersByMandataireId(ctx.user.id);
  }),

  // Portefeuille clients (clients associés aux dossiers du mandataire)
  portefeuille: mandataireProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === "admin") return [];
    const dossiers = await getDossiersByMandataireId(ctx.user.id);
    const clientIds = Array.from(new Set(dossiers.map((d) => d.clientId)));
    const clients = await Promise.all(clientIds.map((id) => getUserById(id)));
    return clients.filter(Boolean).map((client) => ({
      ...client,
      dossiers: dossiers.filter((d) => d.clientId === client!.id),
    }));
  }),

  // Statistiques du mandataire
  stats: mandataireProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === "admin") return null;
    const dossiers = await getDossiersByMandataireId(ctx.user.id);
    const total = dossiers.length;
    const actifs = dossiers.filter((d) => d.statut === "actif").length;
    const contratsSigns = dossiers.filter((d) => d.statut === "contrat_signe").length;
    const enCours = dossiers.filter(
      (d) => d.statut === "en_cours" || d.statut === "devis_envoye" || d.statut === "en_attente_documents"
    ).length;
    const clientIds = new Set(dossiers.map((d) => d.clientId));

    return {
      totalDossiers: total,
      dossiersActifs: actifs,
      contratsSigns,
      enCours,
      totalClients: clientIds.size,
    };
  }),
});
