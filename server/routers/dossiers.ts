import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createDossier,
  deleteDossier,
  getAllDossiers,
  getDossierById,
  getDossiersByClientId,
  getDossiersByMandataireId,
  getDossiersByPrescripteurId,
  updateDossier,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { createNotification } from "../db";
import { getUserById } from "../db";

const dossierTypeEnum = z.enum([
  "assurance_vie",
  "assurance_habitation",
  "assurance_auto",
  "assurance_sante",
  "prevoyance",
  "retraite",
  "autre",
]);

const dossierStatutEnum = z.enum([
  "prospect",
  "en_cours",
  "devis_envoye",
  "en_attente_documents",
  "contrat_signe",
  "actif",
  "resilie",
  "archive",
]);

export const dossiersRouter = router({
  // Liste des dossiers selon le rôle
  list: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    if (user.role === "admin") return getAllDossiers();
    if (user.role === "client" || user.role === "prospect") return getDossiersByClientId(user.id);
    if (user.role === "mandataire") return getDossiersByMandataireId(user.id);
    if (user.role === "prescripteur") return getDossiersByPrescripteurId(user.id);
    return [];
  }),

  // Détail d'un dossier (avec contrôle d'accès)
  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const dossier = await getDossierById(input.id);
      if (!dossier) throw new TRPCError({ code: "NOT_FOUND" });

      const { user } = ctx;
      if (user.role === "admin") return dossier;
      if ((user.role === "client" || user.role === "prospect") && dossier.clientId !== user.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      if (user.role === "mandataire" && dossier.mandataireId !== user.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      if (user.role === "prescripteur" && dossier.prescripteurId !== user.id)
        throw new TRPCError({ code: "FORBIDDEN" });

      return dossier;
    }),

  // Création (admin uniquement)
  create: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        titre: z.string().min(1),
        description: z.string().optional(),
        type: dossierTypeEnum,
        statut: dossierStatutEnum.optional(),
        mandataireId: z.number().optional(),
        prescripteurId: z.number().optional(),
        montantPrime: z.string().optional(),
        dateEffet: z.date().optional(),
        dateEcheance: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin")
        throw new TRPCError({ code: "FORBIDDEN", message: "Réservé à l'admin courtier" });

      const result = await createDossier({
        clientId: input.clientId,
        titre: input.titre,
        description: input.description ?? null,
        type: input.type,
        statut: input.statut ?? "prospect",
        mandataireId: input.mandataireId ?? null,
        prescripteurId: input.prescripteurId ?? null,
        montantPrime: input.montantPrime ?? null,
        dateEffet: input.dateEffet ?? null,
        dateEcheance: input.dateEcheance ?? null,
        notes: input.notes ?? null,
      });

      // Notifier le client
      await createNotification({
        userId: input.clientId,
        titre: "Nouveau dossier créé",
        contenu: `Un nouveau dossier "${input.titre}" a été créé pour vous.`,
        type: "statut_dossier",
        lienId: typeof result?.insertId === "number" ? result.insertId : undefined,
      });

      return result;
    }),

  // Mise à jour (admin ou mandataire assigné)
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        titre: z.string().min(1).optional(),
        description: z.string().optional(),
        type: dossierTypeEnum.optional(),
        statut: dossierStatutEnum.optional(),
        mandataireId: z.number().nullable().optional(),
        prescripteurId: z.number().nullable().optional(),
        montantPrime: z.string().nullable().optional(),
        dateEffet: z.date().nullable().optional(),
        dateEcheance: z.date().nullable().optional(),
        notes: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dossier = await getDossierById(input.id);
      if (!dossier) throw new TRPCError({ code: "NOT_FOUND" });

      const { user } = ctx;
      if (user.role !== "admin" && !(user.role === "mandataire" && dossier.mandataireId === user.id))
        throw new TRPCError({ code: "FORBIDDEN" });

      const { id, ...data } = input;
      await updateDossier(id, data as any);

      // Notifier le client si statut changé
      if (input.statut && input.statut !== dossier.statut) {
        const statutLabels: Record<string, string> = {
          prospect: "Prospect",
          en_cours: "En cours",
          devis_envoye: "Devis envoyé",
          en_attente_documents: "En attente de documents",
          contrat_signe: "Contrat signé",
          actif: "Actif",
          resilie: "Résilié",
          archive: "Archivé",
        };
        await createNotification({
          userId: dossier.clientId,
          titre: "Mise à jour de votre dossier",
          contenu: `Le statut de votre dossier "${dossier.titre}" est passé à : ${statutLabels[input.statut] ?? input.statut}`,
          type: "statut_dossier",
          lienId: id,
        });
      }

      return { success: true };
    }),

  // Suppression (admin uniquement)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin")
        throw new TRPCError({ code: "FORBIDDEN" });
      await deleteDossier(input.id);
      return { success: true };
    }),
});
