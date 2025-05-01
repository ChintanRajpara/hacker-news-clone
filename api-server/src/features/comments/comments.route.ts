import { Router } from "express";
import CommentsController from "./comments.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { readLimiter, writeLimiter } from "../../utils/rateLimiter";

const router = Router();

router.post(
  "/",
  writeLimiter,
  authMiddleware,
  CommentsController.createComment
);
router.put(
  "/:commentId",
  writeLimiter,
  authMiddleware,
  CommentsController.updateComment
);
router.delete(
  "/:commentId",
  writeLimiter,
  authMiddleware,
  CommentsController.deleteComment
);

router.get("/:postId", readLimiter, CommentsController.getComments);

export default router;
