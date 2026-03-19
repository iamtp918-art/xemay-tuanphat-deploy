import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { jwtVerify } from "jose";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  staffUser?: { id: string; username: string; role: string; name: string; department?: string } | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let staffUser: TrpcContext["staffUser"] = null;

  // Try to parse staff JWT from cookie first
  const cookieValue = opts.req.cookies?.[COOKIE_NAME];
  if (cookieValue) {
    try {
      const secret = new TextEncoder().encode(ENV.cookieSecret || "xemay-tuanphat-secret-key-2024");
      const { payload } = await jwtVerify(cookieValue, secret);
      if (payload.type === "staff" && payload.staffId) {
        staffUser = {
          id: payload.staffId as string,
          username: payload.username as string,
          role: payload.role as string,
          name: payload.name as string,
          department: payload.department as string | undefined,
        };
      }
    } catch {
      // Not a staff JWT, try OAuth
    }
  }

  if (!staffUser) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    staffUser,
  };
}
