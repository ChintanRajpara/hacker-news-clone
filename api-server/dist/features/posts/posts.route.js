"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/features/posts/posts.route.ts
const express_1 = require("express");
const posts_controller_1 = require("./posts.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimiter_1 = require("../../utils/rateLimiter");
const router = (0, express_1.Router)();
router.get("/", rateLimiter_1.readLimiter, posts_controller_1.postController.getAll); // Get all posts with pagination and sorting
router.get("/:id", rateLimiter_1.readLimiter, posts_controller_1.postController.getById); // Get post by ID
router.post("/", rateLimiter_1.writeLimiter, auth_middleware_1.authMiddleware, posts_controller_1.postController.create); // Create post
router.put("/:id", rateLimiter_1.writeLimiter, auth_middleware_1.authMiddleware, posts_controller_1.postController.update); // Update post
router.delete("/:id", rateLimiter_1.writeLimiter, auth_middleware_1.authMiddleware, posts_controller_1.postController.delete); // Delete post
router.put("/:id/vote", rateLimiter_1.writeLimiter, auth_middleware_1.authMiddleware, posts_controller_1.postController.vote); // vote post
exports.default = router;
