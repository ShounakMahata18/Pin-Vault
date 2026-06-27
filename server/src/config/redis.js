import { createClient } from "redis";

let cachedClient = null;

const getRedisClient = async () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("Missing REDIS_URL environment variable");
  }

  if (cachedClient && cachedClient.isOpen) {
    return cachedClient;
  }

  if (!cachedClient) {
    cachedClient = createClient({ url: redisUrl });

    cachedClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });
  }

  try {
    await cachedClient.connect();
    console.log("Successfully connected to Redis");
    return cachedClient;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw error;
  }
};

export default getRedisClient;