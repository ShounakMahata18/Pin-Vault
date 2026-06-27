import express, { json } from "express";
import dotenv from "dotenv";
import { createClient } from "redis";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/db.js";
import redis from "../src/config/redis.js";
import authRoutes from "./routes/auth.route.js";
import extensionRoutes from "./routes/extension.route.js";
import userRoutes from "./routes/user.route.js";
import businessRoutes from "./routes/business.route.js";

dotenv.config();
await connectDB();
export const redisClient = await redis();

const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

// routes
app.get("/", (_, res) => res.send("Server is running!"));
app.use("/api", businessRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth/extension", extensionRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
