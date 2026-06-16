import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Routeur commun accessible à tous les rôles authentifiés.
 * Fournit des données partagées sans exposer les procédures admin.
 */
export const commonRouter = router({
  /**
   * Retourne l'utilisateur admin courtier (pour la messagerie).
   * Accessible à tous les rôles authentifiés.
   */
  adminContact: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;
    const result = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.role, "admin"))
      .limit(1);
    return result[0] ?? null;
  }),
});
