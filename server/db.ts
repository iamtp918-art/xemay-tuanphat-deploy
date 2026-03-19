import { eq, desc, asc, like, and, sql, or, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users, categories, motorcycles, contacts, conversations, messages, policies, staffUsers } from "../drizzle/schema";
import type { InsertCategory, InsertMotorcycle, InsertContact, InsertConversation, InsertMessage, InsertPolicy, InsertStaffUser } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

export async function getDb() {
  if (!_db) {
    try {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error("DATABASE_URL is not configured");
      }
      _pool = mysql.createPool({
        uri: databaseUrl,
        ssl: { rejectUnauthorized: true },
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
      });
      _db = drizzle(_pool);
      console.log('[Database] Connected to MySQL (TiDB Cloud)');
    } catch (error) {
      console.error('[Database] Failed to connect:', error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet as any });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Categories
export async function listCategories(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const conditions = activeOnly ? eq(categories.isActive, true) : undefined;
  return db.select().from(categories).where(conditions).orderBy(asc(categories.sortOrder));
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(categories).values(data);
  return result[0].insertId;
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// Motorcycles
export async function listMotorcycles(opts: {
  page?: number; limit?: number; search?: string; brand?: string;
  condition?: string; categoryId?: number; available?: boolean;
  featured?: boolean; minPrice?: number; maxPrice?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const { page = 1, limit = 12, search, brand, condition, categoryId, available, featured, minPrice, maxPrice } = opts;
  const conditions = [];
  if (search) conditions.push(or(like(motorcycles.name, `%${search}%`), like(motorcycles.brand, `%${search}%`)));
  if (brand) conditions.push(eq(motorcycles.brand, brand));
  if (condition) conditions.push(eq(motorcycles.condition, condition as any));
  if (categoryId) conditions.push(eq(motorcycles.categoryId, categoryId));
  if (available !== undefined) conditions.push(eq(motorcycles.isAvailable, available));
  if (featured) conditions.push(eq(motorcycles.isFeatured, true));
  if (minPrice) conditions.push(sql`${motorcycles.price} >= ${minPrice}`);
  if (maxPrice) conditions.push(sql`${motorcycles.price} <= ${maxPrice}`);
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [items, totalResult] = await Promise.all([
    db.select().from(motorcycles).where(where).orderBy(desc(motorcycles.createdAt)).limit(limit).offset((page - 1) * limit),
    db.select({ count: count() }).from(motorcycles).where(where),
  ]);
  return { items, total: totalResult[0]?.count ?? 0 };
}

export async function getMotorcycleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(motorcycles).where(eq(motorcycles.slug, slug)).limit(1);
  return result[0];
}

export async function getMotorcycleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(motorcycles).where(eq(motorcycles.id, id)).limit(1);
  return result[0];
}

export async function createMotorcycle(data: InsertMotorcycle) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(motorcycles).values(data);
  return result[0].insertId;
}

export async function updateMotorcycle(id: number, data: Partial<InsertMotorcycle>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(motorcycles).set(data).where(eq(motorcycles.id, id));
}

export async function deleteMotorcycle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(motorcycles).where(eq(motorcycles.id, id));
}

export async function incrementViewCount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(motorcycles).set({ viewCount: sql`${motorcycles.viewCount} + 1` }).where(eq(motorcycles.id, id));
}

// Contacts
export async function listContacts(page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const [items, totalResult] = await Promise.all([
    db.select().from(contacts).orderBy(desc(contacts.createdAt)).limit(limit).offset((page - 1) * limit),
    db.select({ count: count() }).from(contacts),
  ]);
  return { items, total: totalResult[0]?.count ?? 0 };
}

export async function createContact(data: InsertContact) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(contacts).values(data);
  return result[0].insertId;
}

export async function updateContactStatus(id: number, status: string, note?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const data: any = { status };
  if (note !== undefined) data.note = note;
  await db.update(contacts).set(data).where(eq(contacts.id, id));
}

export async function deleteContact(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(contacts).where(eq(contacts.id, id));
}

// Conversations & Messages
export async function listConversations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversations).orderBy(desc(conversations.updatedAt));
}

export async function getOrCreateConversation(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db.select().from(conversations).where(eq(conversations.sessionId, sessionId)).limit(1);
  if (existing[0]) return existing[0];
  await db.insert(conversations).values({ sessionId });
  const created = await db.select().from(conversations).where(eq(conversations.sessionId, sessionId)).limit(1);
  return created[0];
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(asc(messages.createdAt));
}

export async function addMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(messages).values(data);
  await db.update(conversations).set({ lastMessage: data.content, updatedAt: new Date() }).where(eq(conversations.id, data.conversationId));
}

export async function updateConversationStatus(id: number, status: string, staffId?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const data: any = { status, updatedAt: new Date() };
  if (staffId) data.assignedStaffId = staffId;
  await db.update(conversations).set(data).where(eq(conversations.id, id));
}

// Policies
export async function listPolicies(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const conditions = activeOnly ? eq(policies.isActive, true) : undefined;
  return db.select().from(policies).where(conditions).orderBy(asc(policies.sortOrder));
}

export async function getPolicyBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(policies).where(eq(policies.slug, slug)).limit(1);
  return result[0];
}

export async function createPolicy(data: InsertPolicy) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(policies).values(data);
  return result[0].insertId;
}

export async function updatePolicy(id: number, data: Partial<InsertPolicy>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(policies).set(data).where(eq(policies.id, id));
}

export async function deletePolicy(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(policies).where(eq(policies.id, id));
}

// Staff Users
export async function listStaffUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: staffUsers.id,
    username: staffUsers.username,
    name: staffUsers.name,
    phone: staffUsers.phone,
    role: staffUsers.role,
    department: staffUsers.department,
    isActive: staffUsers.isActive,
    createdAt: staffUsers.createdAt,
    lastLogin: staffUsers.lastLogin,
  }).from(staffUsers).where(eq(staffUsers.role, "staff")).orderBy(desc(staffUsers.createdAt));
}

export async function getStaffByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(staffUsers).where(eq(staffUsers.username, username)).limit(1);
  return result[0];
}

export async function getStaffById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(staffUsers).where(eq(staffUsers.id, id)).limit(1);
  return result[0];
}

export async function createStaffUser(data: { id: string; username: string; password: string; name: string; phone?: string | null; department?: string; role?: string }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(staffUsers).values(data as any);
  return data.id;
}

export async function updateStaffUser(id: string, data: Partial<{ name: string; phone: string; department: string; isActive: boolean }>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(staffUsers).set(data as any).where(eq(staffUsers.id, id));
}

export async function updateStaffPassword(id: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(staffUsers).set({ password }).where(eq(staffUsers.id, id));
}

export async function updateStaffLastLogin(id: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(staffUsers).set({ lastLogin: new Date() }).where(eq(staffUsers.id, id));
}

export async function deleteStaffUser(id: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(staffUsers).where(eq(staffUsers.id, id));
}

// Stats for admin dashboard
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalMotorcycles: 0, totalContacts: 0, totalConversations: 0, newContacts: 0 };
  const [motoCount, contactCount, convCount, newContactCount] = await Promise.all([
    db.select({ count: count() }).from(motorcycles),
    db.select({ count: count() }).from(contacts),
    db.select({ count: count() }).from(conversations),
    db.select({ count: count() }).from(contacts).where(eq(contacts.status, "new")),
  ]);
  return {
    totalMotorcycles: motoCount[0]?.count ?? 0,
    totalContacts: contactCount[0]?.count ?? 0,
    totalConversations: convCount[0]?.count ?? 0,
    newContacts: newContactCount[0]?.count ?? 0,
  };
}
