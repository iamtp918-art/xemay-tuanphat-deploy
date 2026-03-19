import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";
import uploadRouter from "../../server/uploadRouter";
import { seedPolicies } from "../../server/seed-policies";

const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

// Upload routes
app.use(uploadRouter);

// tRPC handler
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Seed policies on first request (lazy init)
let seeded = false;
const originalHandler = app;

const handler = async (req: any, res: any) => {
  if (!seeded) {
    seeded = true;
    try {
      await seedPolicies();
    } catch (e) {
      console.error("[Seed] Policy seeding error:", e);
    }
  }
  return originalHandler(req, res);
};

export default handler;
