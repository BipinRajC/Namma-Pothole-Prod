import { createClient } from "redis";
// Create Redis client with environment-based configuration
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.on("connect", () => console.log("Redis connecting..."));
redisClient.on("ready", () => console.log("Redis ready!"));
redisClient.on("error", (err) => console.error("Redis error:", err));
redisClient.on("end", () => console.log("Redis connection closed"));

export const connectToRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Redis connection error:", err);
    process.exit(1);
  }
};

export const getSession = async (sessionId) => {
  try {
    const session = await redisClient.get(`session:${sessionId}`);
    if (!session) {
      return null;
    }
    return JSON.parse(session);
  } catch (err) {
    console.error("Error getting session:", err);
    return null;
  }
};

export const setSession = async (sessionId, sessionData) => {
  try {
    await redisClient.set(`session:${sessionId}`, JSON.stringify(sessionData), {
      EX: 60,
    });
    return true;
  } catch (err) {
    console.error("Error setting session:", err);
    return false;
  }
};
