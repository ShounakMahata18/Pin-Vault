import express, { json } from "express";
import dotenv from "dotenv";
import { createClient } from "redis";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import extensionRoutes from "./routes/extension.route.js";
import userRoutes from "./routes/user.route.js";
import businessRoutes from "./routes/business.route.js";

dotenv.config();
await connectDB();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.log("Missing redis url");
  process.exit(1);
}

export const redisClient = createClient({
  url: redisUrl,
});

redisClient
  .connect()
  .then(() => console.log("Connected to redis"))
  .catch((err) => console.error("Failed to connect redis"));

const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

// routes
app.use("/api", businessRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth/extension", extensionRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
