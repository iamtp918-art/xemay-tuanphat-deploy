import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import axios from "axios";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { SignJWT } from "jose";
import { ENV } from "./_core/env";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

const SUPER_ADMIN_USERNAME = "CUAHANGXEMAYTUANPHAT";
const SUPER_ADMIN_PASSWORD = "ADMIN123123@@";

async function sendTelegramMessage(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
    });
    return true;
  } catch (e) {
    console.error("[Telegram] Send failed:", e);
    return false;
  }
}

async function createStaffSessionToken(staffUser: { id: string; username: string; role: string; name: string }) {
  const secret = new TextEncoder().encode(ENV.cookieSecret || "xemay-tuanphat-secret-key-2024");
  const token = await new SignJWT({
    staffId: staffUser.id,
    username: staffUser.username,
    role: staffUser.role,
    name: staffUser.name,
    type: "staff",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
    .sign(secret);
  return token;
}

const staffProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const staffUser = (ctx as any).staffUser;
  if (!staffUser) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" });
  }
  return next({ ctx: { ...ctx, staffUser } });
});

const superAdminProcedure = staffProcedure.use(async ({ ctx, next }) => {
  const staffUser = (ctx as any).staffUser;
  if (staffUser.role !== "super_admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Bạn không có quyền truy cập" });
  }
  return next({ ctx });
});

const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  const staffUser = (ctx as any).staffUser;
  if (staffUser) {
    return next({ ctx: { ...ctx, staffUser } });
  }
  if (ctx.user && (ctx.user.role === "admin" || ctx.user.role === "staff")) {
    return next({ ctx });
  }
  throw new TRPCError({ code: "UNAUTHORIZED", message: "Bạn không có quyền truy cập" });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => {
      const staffUser = (opts.ctx as any).staffUser;
      if (staffUser) {
        return {
          id: staffUser.id,
          name: staffUser.name,
          role: staffUser.role,
          username: staffUser.username,
          department: staffUser.department,
          isStaff: true,
        };
      }
      if (opts.ctx.user) {
        return {
          id: opts.ctx.user.id,
          name: opts.ctx.user.name,
          email: opts.ctx.user.email,
          role: opts.ctx.user.role,
          isStaff: false,
        };
      }
      return null;
    }),
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { username, password } = input;
        if (username === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD) {
          const token = await createStaffSessionToken({
            id: "super_admin",
            username: SUPER_ADMIN_USERNAME,
            role: "super_admin",
            name: "Quản Trị Viên",
          });
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
          return {
            success: true,
            user: { id: "super_admin", username: SUPER_ADMIN_USERNAME, role: "super_admin", name: "Quản Trị Viên" },
          };
        }
        const staffUser = await db.getStaffByUsername(username);
        if (!staffUser) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Tài khoản hoặc mật khẩu không đúng" });
        }
        if (!staffUser.isActive) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Tài khoản đã bị tạm khóa" });
        }
        const isValid = await bcrypt.compare(password, staffUser.password);
        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Tài khoản hoặc mật khẩu không đúng" });
        }
        await db.updateStaffLastLogin(staffUser.id);
        const token = await createStaffSessionToken({
          id: staffUser.id,
          username: staffUser.username,
          role: staffUser.role,
          name: staffUser.name,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return {
          success: true,
          user: { id: staffUser.id, username: staffUser.username, role: staffUser.role, name: staffUser.name },
        };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    changePassword: staffProcedure
      .input(z.object({ currentPassword: z.string(), newPassword: z.string().min(6) }))
      .mutation(async ({ input, ctx }) => {
        const staffUser = (ctx as any).staffUser;
        if (staffUser.id === "super_admin") {
          if (input.currentPassword !== SUPER_ADMIN_PASSWORD) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Mật khẩu hiện tại không đúng" });
          }
          throw new TRPCError({ code: "BAD_REQUEST", message: "Không thể đổi mật khẩu tài khoản quản trị gốc" });
        }
        const user = await db.getStaffById(staffUser.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy tài khoản" });
        const isValid = await bcrypt.compare(input.currentPassword, user.password);
        if (!isValid) throw new TRPCError({ code: "BAD_REQUEST", message: "Mật khẩu hiện tại không đúng" });
        const hashed = await bcrypt.hash(input.newPassword, 12);
        await db.updateStaffPassword(staffUser.id, hashed);
        return { success: true };
      }),
  }),

  users: router({
    list: superAdminProcedure.query(async () => {
      return db.listStaffUsers();
    }),
    create: superAdminProcedure
      .input(z.object({
        name: z.string().min(1),
        username: z.string().min(1),
        phone: z.string().optional(),
        department: z.enum(["sales", "customer_care", "both"]).optional(),
        password: z.string().min(4),
      }))
      .mutation(async ({ input }) => {
        const existing = await db.getStaffByUsername(input.username);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Tên đăng nhập đã tồn tại" });
        }
        const hashed = await bcrypt.hash(input.password, 12);
        const id = nanoid(16);
        await db.createStaffUser({
          id,
          username: input.username,
          password: hashed,
          name: input.name,
          phone: input.phone || null,
          department: input.department || "sales",
          role: "staff",
        });
        return { success: true, id };
      }),
    update: superAdminProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        phone: z.string().optional(),
        department: z.enum(["sales", "customer_care", "both"]).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateStaffUser(id, data as any);
        return { success: true };
      }),
    resetPassword: superAdminProcedure
      .input(z.object({ id: z.string(), newPassword: z.string().min(4) }))
      .mutation(async ({ input }) => {
        const hashed = await bcrypt.hash(input.newPassword, 12);
        await db.updateStaffPassword(input.id, hashed);
        return { success: true };
      }),
    toggleActive: superAdminProcedure
      .input(z.object({ id: z.string(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.updateStaffUser(input.id, { isActive: input.isActive });
        return { success: true };
      }),
    delete: superAdminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const user = await db.getStaffById(input.id);
        if (user?.role === "super_admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Không thể xóa tài khoản quản trị gốc" });
        }
        await db.deleteStaffUser(input.id);
        return { success: true };
      }),
  }),

  categories: router({
    list: publicProcedure.input(z.object({ activeOnly: z.boolean().optional() }).optional()).query(async ({ input }) => {
      return db.listCategories(input?.activeOnly ?? false);
    }),
    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      return db.getCategoryBySlug(input.slug);
    }),
    create: adminProcedure.input(z.object({
      name: z.string().min(1), slug: z.string().min(1), description: z.string().optional(),
      imageUrl: z.string().optional(), sortOrder: z.number().optional(), isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      return db.createCategory(input as any);
    }),
    update: adminProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), slug: z.string().optional(),
      description: z.string().optional(), imageUrl: z.string().optional(),
      sortOrder: z.number().optional(), isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCategory(id, data as any);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteCategory(input.id);
      return { success: true };
    }),
  }),

  motorcycles: router({
    list: publicProcedure.input(z.object({
      page: z.number().optional(), limit: z.number().optional(), search: z.string().optional(),
      brand: z.string().optional(), condition: z.string().optional(), categoryId: z.number().optional(),
      available: z.boolean().optional(), featured: z.boolean().optional(),
      minPrice: z.number().optional(), maxPrice: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      return db.listMotorcycles(input ?? {});
    }),
    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const moto = await db.getMotorcycleBySlug(input.slug);
      if (moto) await db.incrementViewCount(moto.id);
      return moto;
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getMotorcycleById(input.id);
    }),
    create: adminProcedure.input(z.object({
      name: z.string().min(1), slug: z.string().min(1), brand: z.string().min(1),
      model: z.string().optional(), year: z.number().optional(), price: z.number(),
      originalPrice: z.number().optional(), condition: z.enum(["like_new", "good", "fair"]).optional(),
      mileage: z.number().optional(), engineSize: z.string().optional(), color: z.string().optional(),
      description: z.string().optional(), features: z.string().optional(), images: z.string().optional(),
      categoryId: z.number().optional(), isAvailable: z.boolean().optional(), isFeatured: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      return db.createMotorcycle(input as any);
    }),
    update: adminProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), slug: z.string().optional(), brand: z.string().optional(),
      model: z.string().optional(), year: z.number().optional(), price: z.number().optional(),
      originalPrice: z.number().optional(), condition: z.enum(["like_new", "good", "fair"]).optional(),
      mileage: z.number().optional(), engineSize: z.string().optional(), color: z.string().optional(),
      description: z.string().optional(), features: z.string().optional(), images: z.string().optional(),
      categoryId: z.number().optional(), isAvailable: z.boolean().optional(), isFeatured: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateMotorcycle(id, data as any);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteMotorcycle(input.id);
      return { success: true };
    }),
  }),

  contacts: router({
    list: adminProcedure.input(z.object({ page: z.number().optional(), limit: z.number().optional() }).optional()).query(async ({ input }) => {
      return db.listContacts(input?.page ?? 1, input?.limit ?? 20);
    }),
    create: publicProcedure.input(z.object({
      fullName: z.string().min(1), phone: z.string().min(1), message: z.string().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createContact(input as any);
      const telegramMsg = `<b>Liên hệ mới từ Website</b>\n\nHọ tên: <b>${input.fullName}</b>\nSĐT: <b>${input.phone}</b>\nNội dung: ${input.message || "Không có"}`;
      await sendTelegramMessage(telegramMsg);
      return { success: true, id };
    }),
    updateStatus: adminProcedure.input(z.object({
      id: z.number(), status: z.enum(["new", "read", "replied"]), note: z.string().optional(),
    })).mutation(async ({ input }) => {
      await db.updateContactStatus(input.id, input.status, input.note);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteContact(input.id);
      return { success: true };
    }),
  }),

  chat: router({
    conversations: adminProcedure.query(async () => {
      return db.listConversations();
    }),
    getMessages: publicProcedure.input(z.object({ conversationId: z.number() })).query(async ({ input }) => {
      return db.getConversationMessages(input.conversationId);
    }),
    getOrCreate: publicProcedure.input(z.object({ sessionId: z.string() })).mutation(async ({ input }) => {
      return db.getOrCreateConversation(input.sessionId);
    }),
    sendMessage: publicProcedure.input(z.object({
      conversationId: z.number(), content: z.string().min(1),
      senderType: z.enum(["customer", "ai", "staff"]), senderName: z.string().optional(),
    })).mutation(async ({ input }) => {
      await db.addMessage(input as any);
      return { success: true };
    }),
    sendCustomerMessage: publicProcedure.input(z.object({
      sessionId: z.string(), content: z.string().min(1), customerName: z.string().optional(),
    })).mutation(async ({ input }) => {
      const conv = await db.getOrCreateConversation(input.sessionId);
      await db.addMessage({ conversationId: conv.id, content: input.content, senderType: "customer", senderName: input.customerName || "Khách hàng" });

      // Nếu khách muốn nói chuyện với nhân viên thật → chuyển trạng thái
      const wantStaff = /nh\u00e2n vi\u00ean|ng\u01b0\u1eddi th\u1eadt|t\u01b0 v\u1ea5n vi\u00ean|n\u00f3i chuy\u1ec7n v\u1edbi ng\u01b0\u1eddi|staff|agent/i.test(input.content);
      if (wantStaff && (conv.status === "ai" || !conv.status)) {
        await db.updateConversationStatus(conv.id, "waiting_staff");
        const staffReply = "D\u1ea1 em chuy\u1ec3n anh/ch\u1ecb qua nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n ngay \u1ea1. Anh/ch\u1ecb ch\u1edd ch\u00fat nh\u00e9!";
        await db.addMessage({ conversationId: conv.id, content: staffReply, senderType: "ai", senderName: "Tr\u1ee3 l\u00fd Tu\u1ea5n Ph\u00e1t" });
        // G\u1eedi th\u00f4ng b\u00e1o Telegram
        await sendTelegramMessage(`<b>Y\u00eau c\u1ea7u nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n</b>\n\nKh\u00e1ch h\u00e0ng #${conv.id} y\u00eau c\u1ea7u n\u00f3i chuy\u1ec7n v\u1edbi nh\u00e2n vi\u00ean.\nN\u1ed9i dung: ${input.content}`);
        return { success: true, aiReply: staffReply, conversationId: conv.id };
      }

      if (conv.status === "ai" || !conv.status) {
        try {
          const msgs = await db.getConversationMessages(conv.id);
          const chatHistory = msgs.slice(-12).map(m => ({
            role: m.senderType === "customer" ? "user" as const : "assistant" as const,
            content: m.content,
          }));

          // Fetch current motorcycle list for context
          let motorcycleContext = "";
          try {
            const motos = await db.listMotorcycles({ limit: 50, available: true });
            if (motos.items.length > 0) {
              motorcycleContext = "\n\nDANH S\u00c1CH XE \u0110ANG C\u00d3 T\u1ea0I C\u1eeca H\u00c0NG:\n" + motos.items.map(m => {
                const price = m.price >= 1000000 ? (m.price / 1000000).toFixed(1) + " tri\u1ec7u" : m.price.toLocaleString("vi-VN") + "\u0111";
                const details = [m.brand, m.year ? `\u0111\u1eddi ${m.year}` : "", m.color || "", m.mileage ? `${m.mileage.toLocaleString("vi-VN")}km` : "", m.engineSize || ""].filter(Boolean).join(", ");
                const cond = m.condition === "like_new" ? "Nh\u01b0 m\u1edbi" : m.condition === "good" ? "T\u1ed1t" : "Kh\u00e1";
                return `- ${m.name} (${details}) - Gi\u00e1: ${price} - T\u00ecnh tr\u1ea1ng: ${cond}`;
              }).join("\n");
            }
          } catch (e) { /* ignore */ }

          // Fetch policies for context
          let policyContext = "";
          try {
            const pols = await db.listPolicies(true);
            if (pols.length > 0) {
              policyContext = "\n\nCH\u00cdNH S\u00c1CH CHI TI\u1ebeT:\n" + pols.map(p => `[${p.title}]: ${p.content.substring(0, 300)}`).join("\n");
            }
          } catch (e) { /* ignore */ }

          const response = await invokeLLM({
            messages: [
              { role: "system", content: `B\u1ea1n l\u00e0 Tu\u1ea5n - nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n b\u00e1n xe m\u00e1y t\u1ea1i C\u1eeda H\u00e0ng Xe M\u00e1y Tu\u1ea5n Ph\u00e1t. B\u1ea1n \u0111ang chat tr\u1ef1c ti\u1ebfp v\u1edbi kh\u00e1ch h\u00e0ng qua tin nh\u1eafn.

=== TH\u00d4NG TIN C\u1eeca H\u00c0NG ===
T\u00ean: Xe M\u00e1y Tu\u1ea5n Ph\u00e1t
\u0110\u1ecba ch\u1ec9: \u1ea4p 1, Long Th\u1ecd, Nh\u01a1n Tr\u1ea1ch, \u0110\u1ed3ng Nai
Hotline/Zalo: 0335.111.777
Gi\u1edd m\u1edf c\u1eeda: 7:30 - 19:00 h\u00e0ng ng\u00e0y (k\u1ec3 c\u1ea3 cu\u1ed1i tu\u1ea7n v\u00e0 l\u1ec5)
Chuy\u00ean: Mua b\u00e1n xe m\u00e1y c\u0169 \u0111\u00e3 qua s\u1eed d\u1ee5ng c\u00e1c h\u00e3ng Honda, Yamaha, Suzuki, SYM, Piaggio, Vespa, Kymco, VinFast, Peugeot, Kawasaki, Benelli, GPX, Royal Enfield...
\u0110\u1eb7c bi\u1ec7t: Nh\u1eadn thu mua xe c\u0169 gi\u00e1 cao, h\u1ed7 tr\u1ee3 \u0111\u1ed5i xe c\u0169 l\u1ea5y xe m\u1edbi

=== CH\u00cdNH S\u00c1CH ===
Tr\u1ea3 g\u00f3p: H\u1ed7 tr\u1ee3 t\u1eeb 18 tu\u1ed5i, tr\u1ea3 tr\u01b0\u1edbc t\u1eeb 0 \u0111\u1ed3ng, duy\u1ec7t nhanh 30 ph\u00fat - 2 gi\u1edd. Th\u1eddi h\u1ea1n 6-36 th\u00e1ng, l\u00e3i su\u1ea5t t\u1eeb 0.69%/th\u00e1ng. Ch\u1ec9 c\u1ea7n CCCD + H\u1ed9 kh\u1ea9u. \u0110\u1ed1i t\u00e1c: FE Credit, HD Saison, Mcredit, VPBank.
B\u1ea3o h\u00e0nh: 6-12 th\u00e1ng cho \u0111\u1ed9ng c\u01a1, h\u1ed9p s\u1ed1, h\u1ec7 th\u1ed1ng \u0111i\u1ec7n. Xe tay ga cao c\u1ea5p (SH, PCX, Airblade \u0111\u1eddi m\u1edbi) b\u1ea3o h\u00e0nh 12 th\u00e1ng.
\u0110\u1ed5i tr\u1ea3: Trong 48 gi\u1edd n\u1ebfu ph\u00e1t hi\u1ec7n l\u1ed7i k\u1ef9 thu\u1eadt t\u1eeb ph\u00eda c\u1eeda h\u00e0ng.
Sang t\u00ean: H\u1ed7 tr\u1ee3 l\u00e0m th\u1ee7 t\u1ee5c sang t\u00ean ch\u00ednh ch\u1ee7 nhanh trong ng\u00e0y.
Ship xe: H\u1ed7 tr\u1ee3 giao xe to\u00e0n qu\u1ed1c (kh\u00e1ch ch\u1ecbu ph\u00ed v\u1eadn chuy\u1ec3n).${motorcycleContext}${policyContext}

=== QUY T\u1eaeC TR\u1ea2 L\u1edcI ===
1. X\u01b0ng "em", g\u1ecdi kh\u00e1ch l\u00e0 "anh/ch\u1ecb"
2. N\u00f3i chuy\u1ec7n t\u1ef1 nhi\u00ean, th\u00e2n thi\u1ec7n nh\u01b0 nh\u1eafn tin Zalo v\u1edbi kh\u00e1ch quen
3. Tr\u1ea3 l\u1eddi ng\u1eafn g\u1ecdn 2-4 c\u00e2u, \u0111i th\u1eb3ng v\u00e0o v\u1ea5n \u0111\u1ec1
4. Ch\u1ee7 \u0111\u1ed9ng h\u1ecfi nhu c\u1ea7u: \u0111i l\u1ea1i h\u00e0ng ng\u00e0y hay ch\u1ea1y xa, ng\u00e2n s\u00e1ch, th\u00edch xe s\u1ed1 hay tay ga, tr\u1ea3 g\u00f3p hay ti\u1ec1n m\u1eb7t
5. Khi g\u1ee3i \u00fd xe t\u1eeb danh s\u00e1ch: n\u00eau t\u00ean xe + gi\u00e1 + \u01b0u \u0111i\u1ec3m ng\u1eafn g\u1ecdn
6. Lu\u00f4n m\u1eddi kh\u00e1ch gh\u00e9 c\u1eeda h\u00e0ng ho\u1eb7c g\u1ecdi/Zalo 0335.111.777
7. N\u1ebfu kh\u00e1ch h\u1ecfi ngo\u00e0i chuy\u00ean m\u00f4n: tr\u1ea3 l\u1eddi l\u1ecbch s\u1ef1 r\u1ed3i h\u1ecfi l\u1ea1i v\u1ec1 nhu c\u1ea7u xe
8. N\u1ebfu kh\u00f4ng ch\u1eafc: "\u0110\u1ec3 em ki\u1ec3m tra l\u1ea1i r\u1ed3i b\u00e1o anh/ch\u1ecb nh\u00e9! Ho\u1eb7c g\u1ecdi 0335.111.777 \u0111\u1ec3 em t\u01b0 v\u1ea5n chi ti\u1ebft h\u01a1n \u1ea1."
9. TUY\u1ec6T \u0110\u1ed0I KH\u00d4NG b\u1ecba th\u00f4ng tin xe n\u1ebfu kh\u00f4ng c\u00f3 trong danh s\u00e1ch
10. KH\u00d4NG d\u00f9ng markdown, bullet points, d\u1ea5u *, #. Ch\u1ec9 vi\u1ebft text thu\u1ea7n t\u00fay, xu\u1ed1ng d\u00f2ng b\u00ecnh th\u01b0\u1eddng.` },
              ...chatHistory,
            ],
          });
          const aiReply = (response.choices?.[0]?.message?.content as string) || "Xin l\u1ed7i, em ch\u01b0a hi\u1ec3u c\u00e2u h\u1ecfi c\u1ee7a anh/ch\u1ecb. Anh/ch\u1ecb c\u00f3 th\u1ec3 li\u00ean h\u1ec7 hotline 0335.111.777 \u0111\u1ec3 \u0111\u01b0\u1ee3c h\u1ed7 tr\u1ee3 \u1ea1.";
          await db.addMessage({ conversationId: conv.id, content: aiReply, senderType: "ai", senderName: "Tr\u1ee3 l\u00fd Tu\u1ea5n Ph\u00e1t" });
          return { success: true, aiReply, conversationId: conv.id };
        } catch (e) {
          console.error("[AI Chat] Error:", e);
          const fallback = "Xin l\u1ed7i anh/ch\u1ecb, h\u1ec7 th\u1ed1ng \u0111ang b\u1eadn. Anh/ch\u1ecb vui l\u00f2ng g\u1ecdi hotline 0335.111.777 ho\u1eb7c nh\u1eafn Zalo \u0111\u1ec3 \u0111\u01b0\u1ee3c t\u01b0 v\u1ea5n ngay \u1ea1.";
          await db.addMessage({ conversationId: conv.id, content: fallback, senderType: "ai", senderName: "Tr\u1ee3 l\u00fd Tu\u1ea5n Ph\u00e1t" });
          return { success: true, aiReply: fallback, conversationId: conv.id };
        }
      }
      return { success: true, conversationId: conv.id };
    }),
    updateStatus: adminProcedure.input(z.object({
      id: z.number(), status: z.enum(["ai", "waiting_staff", "staff", "closed"]), staffId: z.string().optional(),
    })).mutation(async ({ input }) => {
      await db.updateConversationStatus(input.id, input.status, input.staffId);
      return { success: true };
    }),
  }),

  policies: router({
    list: publicProcedure.input(z.object({ activeOnly: z.boolean().optional() }).optional()).query(async ({ input }) => {
      return db.listPolicies(input?.activeOnly ?? true);
    }),
    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      return db.getPolicyBySlug(input.slug);
    }),
    create: adminProcedure.input(z.object({
      title: z.string().min(1), slug: z.string().min(1), content: z.string().min(1),
      type: z.enum(["warranty", "installment", "return", "privacy", "terms", "guide"]),
      isActive: z.boolean().optional(), sortOrder: z.number().optional(),
    })).mutation(async ({ input }) => {
      return db.createPolicy(input as any);
    }),
    update: adminProcedure.input(z.object({
      id: z.number(), title: z.string().optional(), slug: z.string().optional(),
      content: z.string().optional(), type: z.enum(["warranty", "installment", "return", "privacy", "terms", "guide"]).optional(),
      isActive: z.boolean().optional(), sortOrder: z.number().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updatePolicy(id, data as any);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deletePolicy(input.id);
      return { success: true };
    }),
  }),

  dashboard: router({
    stats: adminProcedure.query(async () => {
      return db.getDashboardStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
