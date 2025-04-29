import { Router } from "express";
import CommentsController from "./comments.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// Authenticated users
router.post("/", authMiddleware, CommentsController.createComment);
router.put("/:commentId", authMiddleware, CommentsController.updateComment);
router.delete("/:commentId", authMiddleware, CommentsController.deleteComment);

// Public
router.get("/:postId", CommentsController.getComments);

export default router;
