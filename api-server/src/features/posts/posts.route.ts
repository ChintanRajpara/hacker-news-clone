// src/features/posts/posts.route.ts
import { Router } from "express";
import { postController } from "./posts.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { readLimiter, writeLimiter } from "../../utils/rateLimiter";

const router = Router();

router.get("/", readLimiter, postController.getAll); // Get all posts with pagination and sorting
router.get("/:id", readLimiter, postController.getById); // Get post by ID

router.post("/", writeLimiter, authMiddleware, postController.create); // Create post
router.put("/:id", writeLimiter, authMiddleware, postController.update); // Update post
router.delete("/:id", writeLimiter, authMiddleware, postController.delete); // Delete post
router.put("/:id/vote", writeLimiter, authMiddleware, postController.vote); // vote post

export default router;
