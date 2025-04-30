// src/features/posts/posts.route.ts
import { Router } from "express";
import { postController } from "./posts.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// Public routes (no authentication required)
router.get("/", postController.getAll); // Get all posts with pagination and sorting
router.get("/:id", postController.getById); // Get post by ID

// Authenticated user routes (authentication required)
router.post("/", authMiddleware, postController.create); // Create post
router.put("/:id", authMiddleware, postController.update); // Update post
router.delete("/:id", authMiddleware, postController.delete); // Delete post
router.put("/:id/vote", authMiddleware, postController.vote);

export default router;
