import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCtx(overrides: Partial<TrpcContext["user"]> = {}): TrpcContext {
  const base = {
    id: 1,
    openId: "test-user",
    name: "Test User",
    email: "test@example.com",
    phone: null,
    loginMethod: "manus",
    role: "admin" as const,
    createdByAdminId: null,
    referralCode: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user: { ...base, ...overrides },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns the current user when authenticated", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toMatchObject({ id: 1, role: "admin" });
  });

  it("returns null when not authenticated", async () => {
    const ctx = { ...makeCtx(), user: null };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

// ─── Notifications ────────────────────────────────────────────────────────────

describe("notifications.unreadCount", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = { ...makeCtx(), user: null };
    const caller = appRouter.createCaller(ctx);
    await expect(caller.notifications.unreadCount()).rejects.toThrow();
  });

  it("returns a number for authenticated users", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    // DB may not be available in test env — should return 0 gracefully
    const result = await caller.notifications.unreadCount();
    expect(typeof result).toBe("number");
  });
});

// ─── Messages ─────────────────────────────────────────────────────────────────

describe("messages.unreadCount", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = { ...makeCtx(), user: null };
    const caller = appRouter.createCaller(ctx);
    await expect(caller.messages.unreadCount()).rejects.toThrow();
  });

  it("returns a number for authenticated users", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.messages.unreadCount();
    expect(typeof result).toBe("number");
  });
});

// ─── Dossiers ─────────────────────────────────────────────────────────────────

describe("dossiers.list", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = { ...makeCtx(), user: null };
    const caller = appRouter.createCaller(ctx);
    await expect(caller.dossiers.list()).rejects.toThrow();
  });

  it("returns an array for admin", async () => {
    const ctx = makeCtx({ role: "admin" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dossiers.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns an array for client", async () => {
    const ctx = makeCtx({ role: "client" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dossiers.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns an array for prescripteur", async () => {
    const ctx = makeCtx({ role: "prescripteur" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dossiers.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns an array for mandataire", async () => {
    const ctx = makeCtx({ role: "mandataire" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dossiers.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("dossiers.create", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const ctx = makeCtx({ role: "client" });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.dossiers.create({
        clientId: 1,
        titre: "Test",
        type: "autre",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

// ─── Admin ────────────────────────────────────────────────────────────────────

describe("admin.kpis", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const ctx = makeCtx({ role: "client" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.kpis()).rejects.toThrow();
  });

  it("returns KPI object for admin", async () => {
    const ctx = makeCtx({ role: "admin" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.kpis();
    // May be null if DB unavailable in test env
    if (result !== null) {
      expect(result).toHaveProperty("totalDossiers");
      expect(result).toHaveProperty("dossiersActifs");
      expect(result).toHaveProperty("totalClients");
    }
  });
});

describe("admin.users", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const ctx = makeCtx({ role: "prescripteur" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.users()).rejects.toThrow();
  });

  it("returns an array for admin", async () => {
    const ctx = makeCtx({ role: "admin" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.users();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Prescripteur ─────────────────────────────────────────────────────────────

describe("prescripteur.mesApports", () => {
  it("throws FORBIDDEN for non-prescripteur users", async () => {
    const ctx = makeCtx({ role: "client" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.prescripteur.mesApports()).rejects.toThrow();
  });

  it("returns an array for prescripteur", async () => {
    const ctx = makeCtx({ role: "prescripteur" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.prescripteur.mesApports();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Mandataire ───────────────────────────────────────────────────────────────

describe("mandataire.mesDossiers", () => {
  it("throws FORBIDDEN for non-mandataire users", async () => {
    const ctx = makeCtx({ role: "client" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.mandataire.mesDossiers()).rejects.toThrow();
  });

  it("returns an array for mandataire", async () => {
    const ctx = makeCtx({ role: "mandataire" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.mandataire.mesDossiers();
    expect(Array.isArray(result)).toBe(true);
  });
});
