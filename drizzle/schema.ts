import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "client", "prospect", "prescripteur", "mandataire"])
    .default("prospect")
    .notNull(),
  // Mandataire: référence à l'admin qui l'a créé
  createdByAdminId: int("createdByAdminId"),
  // Prescripteur / Mandataire : code de parrainage
  referralCode: varchar("referralCode", { length: 32 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Dossiers ─────────────────────────────────────────────────────────────────
export const dossiers = mysqlTable("dossiers", {
  id: int("id").autoincrement().primaryKey(),
  // Propriétaire du dossier (client ou prospect)
  clientId: int("clientId").notNull(),
  // Mandataire en charge (optionnel)
  mandataireId: int("mandataireId"),
  // Prescripteur à l'origine (optionnel)
  prescripteurId: int("prescripteurId"),
  titre: varchar("titre", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", [
    "assurance_vie",
    "assurance_habitation",
    "assurance_auto",
    "assurance_sante",
    "prevoyance",
    "retraite",
    "autre",
  ])
    .default("autre")
    .notNull(),
  statut: mysqlEnum("statut", [
    "prospect",
    "en_cours",
    "devis_envoye",
    "en_attente_documents",
    "contrat_signe",
    "actif",
    "resilie",
    "archive",
  ])
    .default("prospect")
    .notNull(),
  montantPrime: decimal("montantPrime", { precision: 10, scale: 2 }),
  dateEffet: timestamp("dateEffet"),
  dateEcheance: timestamp("dateEcheance"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Dossier = typeof dossiers.$inferSelect;
export type InsertDossier = typeof dossiers.$inferInsert;

// ─── Documents ────────────────────────────────────────────────────────────────
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  dossierId: int("dossierId").notNull(),
  uploaderId: int("uploaderId").notNull(),
  nom: varchar("nom", { length: 255 }).notNull(),
  type: mysqlEnum("type", [
    "piece_identite",
    "contrat",
    "devis",
    "justificatif_domicile",
    "rib",
    "bulletin_salaire",
    "autre",
  ])
    .default("autre")
    .notNull(),
  s3Key: varchar("s3Key", { length: 512 }).notNull(),
  s3Url: text("s3Url").notNull(),
  mimeType: varchar("mimeType", { length: 128 }),
  taille: int("taille"), // en octets
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  // Dossier lié (optionnel)
  dossierId: int("dossierId"),
  contenu: text("contenu").notNull(),
  lu: boolean("lu").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  titre: varchar("titre", { length: 255 }).notNull(),
  contenu: text("contenu").notNull(),
  type: mysqlEnum("type", [
    "nouveau_message",
    "nouveau_document",
    "statut_dossier",
    "nouvelle_demande",
    "invitation",
    "autre",
  ])
    .default("autre")
    .notNull(),
  lu: boolean("lu").default(false).notNull(),
  lienId: int("lienId"), // id du dossier, message, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ─── Apports (Prescripteurs) ──────────────────────────────────────────────────
export const apports = mysqlTable("apports", {
  id: int("id").autoincrement().primaryKey(),
  prescripteurId: int("prescripteurId").notNull(),
  // Client recommandé
  clientNom: varchar("clientNom", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 32 }),
  // Dossier créé suite à l'apport (optionnel)
  dossierId: int("dossierId"),
  statut: mysqlEnum("statut", [
    "en_attente",
    "contacte",
    "en_cours",
    "converti",
    "perdu",
  ])
    .default("en_attente")
    .notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Apport = typeof apports.$inferSelect;
export type InsertApport = typeof apports.$inferInsert;

// ─── Invitations ──────────────────────────────────────────────────────────────
export const invitations = mysqlTable("invitations", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  role: mysqlEnum("role", ["client", "prospect", "prescripteur", "mandataire"])
    .notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  createdByAdminId: int("createdByAdminId").notNull(),
  utilisee: boolean("utilisee").default(false).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;
