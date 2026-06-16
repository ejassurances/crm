import { and, desc, eq, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  apports,
  documents,
  dossiers,
  InsertApport,
  InsertDocument,
  InsertDossier,
  InsertInvitation,
  InsertMessage,
  InsertNotification,
  InsertUser,
  invitations,
  messages,
  notifications,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "phone", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUsersByRole(role: "client" | "prospect" | "prescripteur" | "mandataire") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.role, role)).orderBy(desc(users.createdAt));
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

// ─── Dossiers ─────────────────────────────────────────────────────────────────

export async function createDossier(data: InsertDossier) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(dossiers).values(data);
  return result;
}

export async function getDossierById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(dossiers).where(eq(dossiers.id, id)).limit(1);
  return result[0];
}

export async function getDossiersByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dossiers).where(eq(dossiers.clientId, clientId)).orderBy(desc(dossiers.createdAt));
}

export async function getDossiersByMandataireId(mandataireId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dossiers).where(eq(dossiers.mandataireId, mandataireId)).orderBy(desc(dossiers.createdAt));
}

export async function getDossiersByPrescripteurId(prescripteurId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dossiers).where(eq(dossiers.prescripteurId, prescripteurId)).orderBy(desc(dossiers.createdAt));
}

export async function getAllDossiers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dossiers).orderBy(desc(dossiers.createdAt));
}

export async function updateDossier(id: number, data: Partial<InsertDossier>) {
  const db = await getDb();
  if (!db) return;
  await db.update(dossiers).set(data).where(eq(dossiers.id, id));
}

export async function deleteDossier(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(dossiers).where(eq(dossiers.id, id));
}

// ─── Documents ────────────────────────────────────────────────────────────────

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(documents).values(data);
  return result;
}

export async function getDocumentsByDossierId(dossierId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.dossierId, dossierId)).orderBy(desc(documents.createdAt));
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return result[0];
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(documents).where(eq(documents.id, id));
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(messages).values(data);
  return result;
}

export async function getConversation(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(messages)
    .where(
      or(
        and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
      )
    )
    .orderBy(messages.createdAt);
}

export async function getMessagesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(messages)
    .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
    .orderBy(desc(messages.createdAt));
}

export async function markMessagesAsRead(receiverId: number, senderId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(messages)
    .set({ lu: true })
    .where(and(eq(messages.receiverId, receiverId), eq(messages.senderId, senderId)));
}

export async function getUnreadMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(and(eq(messages.receiverId, userId), eq(messages.lu, false)));
  return result[0]?.count ?? 0;
}

export async function getAllConversationsForAdmin(adminId: number) {
  const db = await getDb();
  if (!db) return [];
  // Récupère tous les messages impliquant l'admin
  return db
    .select()
    .from(messages)
    .where(or(eq(messages.senderId, adminId), eq(messages.receiverId, adminId)))
    .orderBy(desc(messages.createdAt));
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function getNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ lu: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ lu: true }).where(eq(notifications.userId, userId));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.lu, false)));
  return result[0]?.count ?? 0;
}

// ─── Apports ──────────────────────────────────────────────────────────────────

export async function createApport(data: InsertApport) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(apports).values(data);
  return result;
}

export async function getApportsByPrescripteurId(prescripteurId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(apports)
    .where(eq(apports.prescripteurId, prescripteurId))
    .orderBy(desc(apports.createdAt));
}

export async function getAllApports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(apports).orderBy(desc(apports.createdAt));
}

export async function updateApport(id: number, data: Partial<InsertApport>) {
  const db = await getDb();
  if (!db) return;
  await db.update(apports).set(data).where(eq(apports.id, id));
}

// ─── Invitations ──────────────────────────────────────────────────────────────

export async function createInvitation(data: InsertInvitation) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(invitations).values(data);
}

export async function getInvitationByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invitations).where(eq(invitations.token, token)).limit(1);
  return result[0];
}

export async function markInvitationUsed(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(invitations).set({ utilisee: true }).where(eq(invitations.id, id));
}

export async function getAllInvitations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invitations).orderBy(desc(invitations.createdAt));
}

// ─── KPIs Admin ───────────────────────────────────────────────────────────────

export async function getAdminKPIs() {
  const db = await getDb();
  if (!db) return null;

  const [
    totalDossiers,
    dossiersActifs,
    contratsSigns,
    prospects,
    totalClients,
    totalPrescripteurs,
    totalMandataires,
    totalApports,
    apportsConvertis,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(dossiers),
    db.select({ count: sql<number>`count(*)` }).from(dossiers).where(eq(dossiers.statut, "actif")),
    db.select({ count: sql<number>`count(*)` }).from(dossiers).where(eq(dossiers.statut, "contrat_signe")),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "prospect")),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "client")),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "prescripteur")),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "mandataire")),
    db.select({ count: sql<number>`count(*)` }).from(apports),
    db.select({ count: sql<number>`count(*)` }).from(apports).where(eq(apports.statut, "converti")),
  ]);

  return {
    totalDossiers: totalDossiers[0]?.count ?? 0,
    dossiersActifs: dossiersActifs[0]?.count ?? 0,
    contratsSigns: contratsSigns[0]?.count ?? 0,
    prospects: prospects[0]?.count ?? 0,
    totalClients: totalClients[0]?.count ?? 0,
    totalPrescripteurs: totalPrescripteurs[0]?.count ?? 0,
    totalMandataires: totalMandataires[0]?.count ?? 0,
    totalApports: totalApports[0]?.count ?? 0,
    apportsConvertis: apportsConvertis[0]?.count ?? 0,
    tauxConversion:
      (totalApports[0]?.count ?? 0) > 0
        ? Math.round(((apportsConvertis[0]?.count ?? 0) / (totalApports[0]?.count ?? 0)) * 100)
        : 0,
  };
}
