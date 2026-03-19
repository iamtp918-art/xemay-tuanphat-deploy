import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@test.com",
    name: "Admin",
    loginMethod: "test",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("Public routes", () => {
  it("auth.me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("categories.list returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("motorcycles.list returns items and total", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.motorcycles.list({ page: 1, limit: 10 });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("policies.list returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.policies.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("contacts.create requires fullName and phone", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.contacts.create({ fullName: "", phone: "0123456789" })
    ).rejects.toThrow();
  });
});

describe("Admin routes", () => {
  it("dashboard.stats returns stats object", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.dashboard.stats();
    expect(result).toHaveProperty("totalMotorcycles");
    expect(result).toHaveProperty("totalContacts");
    expect(result).toHaveProperty("totalConversations");
    expect(result).toHaveProperty("newContacts");
  });

  it("chat.conversations returns an array for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.chat.conversations();
    expect(Array.isArray(result)).toBe(true);
  });

  it("contacts.list returns items for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.contacts.list({ page: 1, limit: 10 });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
  });
});

describe("Protected routes deny unauthenticated", () => {
  it("dashboard.stats rejects unauthenticated", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.dashboard.stats()).rejects.toThrow();
  });

  it("contacts.list rejects unauthenticated", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.contacts.list()).rejects.toThrow();
  });
});
