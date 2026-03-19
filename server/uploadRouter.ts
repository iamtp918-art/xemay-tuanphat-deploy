import express from "express";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

// Dynamic import for storage (ESM compatible)
let storagePut: any = null;

async function initStorage() {
  try {
    const storage = await import("./storage.js");
    storagePut = storage.storagePut;
    console.log("[Upload] Storage proxy initialized successfully");
  } catch (e) {
    console.log("[Upload] Storage proxy not available, using local file storage");
  }
}

// Initialize storage on module load
initStorage();

const uploadRouter = express.Router();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), "client", "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Serve uploaded files statically
uploadRouter.use("/uploads", express.static(UPLOAD_DIR));

async function saveFile(data: string, filename: string, contentType: string): Promise<{ url: string; key: string }> {
  const ext = filename.split(".").pop() || "jpg";
  const key = `uploads/${nanoid(12)}.${ext}`;
  const buffer = Buffer.from(data, "base64");

  // Try storage proxy first
  if (storagePut) {
    try {
      const result = await storagePut(key, buffer, contentType || "image/jpeg");
      return { url: result.url, key: result.key };
    } catch (e) {
      console.warn("[Upload] Storage proxy failed, falling back to local:", (e as Error).message);
    }
  }

  // Fallback: save to local file system
  const localFilename = `${nanoid(12)}.${ext}`;
  const localPath = path.join(UPLOAD_DIR, localFilename);
  fs.writeFileSync(localPath, buffer);
  const url = `/uploads/${localFilename}`;
  console.log("[Upload] Saved locally:", url);
  return { url, key: localFilename };
}

uploadRouter.post("/api/upload", async (req, res) => {
  try {
    const { data, filename, contentType } = req.body;
    if (!data || !filename) {
      return res.status(400).json({ error: "Missing data or filename" });
    }

    // Handle data that might include data URL prefix
    let cleanData = data;
    if (data.includes(",")) {
      cleanData = data.split(",").pop() || data;
    }

    const result = await saveFile(cleanData, filename, contentType || "image/jpeg");
    return res.json(result);
  } catch (error: any) {
    console.error("[Upload] Error:", error);
    return res.status(500).json({ error: error.message || "Upload failed" });
  }
});

uploadRouter.post("/api/upload-multiple", async (req, res) => {
  try {
    const { files } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "No files provided" });
    }
    const results = [];
    for (const file of files) {
      let cleanData = file.data;
      if (cleanData && cleanData.includes(",")) {
        cleanData = cleanData.split(",").pop() || cleanData;
      }
      const result = await saveFile(cleanData, file.filename || "image.jpg", file.contentType || "image/jpeg");
      results.push({ ...result, filename: file.filename });
    }
    return res.json({ urls: results.map(r => r.url), results });
  } catch (error: any) {
    console.error("[Upload Multiple] Error:", error);
    return res.status(500).json({ error: error.message || "Upload failed" });
  }
});

export default uploadRouter;
