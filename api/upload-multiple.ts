import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import uploadRouter from "../server/uploadRouter";

const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.use(uploadRouter);

export default app;
