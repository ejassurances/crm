import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createDocument,
  createNotification,
  deleteDocument,
  getDossierById,
  getDocumentById,
  getDocumentsByDossierId,
  getAllUsers,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import { notifyOwner } from "../_core/notification";

export const documentsRouter = router({
  // Liste des documents d'un dossier (avec contrôle d'accès)
  byDossier: protectedProcedure
    .input(z.object({ dossierId: z.number() }))
    .query(async ({ ctx, input }) => {
      const dossier = await getDossierById(input.dossierId);
      if (!dossier) throw new TRPCError({ code: "NOT_FOUND" });

      const { user } = ctx;
      if (user.role === "admin") return getDocumentsByDossierId(input.dossierId);
      if ((user.role === "client" || user.role === "prospect") && dossier.clientId !== user.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      if (user.role === "mandataire" && dossier.mandataireId !== user.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      if (user.role === "prescripteur" && dossier.prescripteurId !== user.id)
        throw new TRPCError({ code: "FORBIDDEN" });

      return getDocumentsByDossierId(input.dossierId);
    }),

  // Upload d'un document (base64 → S3)
  upload: protectedProcedure
    .input(
      z.object({
        dossierId: z.number(),
        nom: z.string().min(1),
        type: z.enum([
          "piece_identite",
          "contrat",
          "devis",
          "justificatif_domicile",
          "rib",
          "bulletin_salaire",
          "autre",
        ]),
        mimeType: z.string(),
        taille: z.number(),
        // Contenu du fichier en base64
        base64: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dossier = await getDossierById(input.dossierId);
      if (!dossier) throw new TRPCError({ code: "NOT_FOUND" });

      const { user } = ctx;
      // Contrôle d'accès : seul le client propriétaire, le mandataire assigné ou l'admin peuvent uploader
      if (user.role !== "admin") {
        if ((user.role === "client" || user.role === "prospect") && dossier.clientId !== user.id)
          throw new TRPCError({ code: "FORBIDDEN" });
        if (user.role === "mandataire" && dossier.mandataireId !== user.id)
          throw new TRPCError({ code: "FORBIDDEN" });
        if (user.role === "prescripteur")
          throw new TRPCError({ code: "FORBIDDEN", message: "Les prescripteurs ne peuvent pas uploader de documents" });
      }

      // Taille max 10 Mo
      if (input.taille > 10 * 1024 * 1024)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Fichier trop volumineux (max 10 Mo)" });

      // Upload S3
      const buffer = Buffer.from(input.base64, "base64");
      const timestamp = Date.now();
      const safeNom = input.nom.replace(/[^a-zA-Z0-9._-]/g, "_");
      const s3Key = `dossiers/${input.dossierId}/docs/${timestamp}_${safeNom}`;
      const { key, url } = await storagePut(s3Key, buffer, input.mimeType);

      // Sauvegarder en BDD
      await createDocument({
        dossierId: input.dossierId,
        uploaderId: user.id,
        nom: input.nom,
        type: input.type,
        s3Key: key,
        s3Url: url,
        mimeType: input.mimeType,
        taille: input.taille,
      });

      // Notifier l'admin
      await notifyOwner({
        title: `📄 Nouveau document déposé`,
        content: `${user.name ?? "Un utilisateur"} a déposé le document "${input.nom}" dans le dossier #${input.dossierId}.`,
      });

      // Notification interne à l'admin
      const admins = (await getAllUsers()).filter((u) => u.role === "admin");
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          titre: "Nouveau document déposé",
          contenu: `${user.name ?? "Un utilisateur"} a déposé "${input.nom}" dans le dossier #${input.dossierId}.`,
          type: "nouveau_document",
          lienId: input.dossierId,
        });
      }

      return { success: true, url };
    }),

  // Suppression (admin ou uploader)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const doc = await getDocumentById(input.id);
      if (!doc) throw new TRPCError({ code: "NOT_FOUND" });

      const { user } = ctx;
      if (user.role !== "admin" && doc.uploaderId !== user.id)
        throw new TRPCError({ code: "FORBIDDEN" });

      await deleteDocument(input.id);
      return { success: true };
    }),
});
