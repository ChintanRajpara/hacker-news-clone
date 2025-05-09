import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

export const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "test" ? Infinity : 20,
  message: "Too many write operations, slow down!",
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? Infinity : 5, // max 5 attempts per IP
  message: "Too many attempts, try again later",
});

export const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "test" ? Infinity : 60,
});
