import { Router } from "express";
import usersController from "./users.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authLimiter, readLimiter } from "../../utils/rateLimiter";

const router = Router();

router.post("/signup", authLimiter, usersController.signup);
router.post("/login", authLimiter, usersController.login);
router.post("/logout", authLimiter, usersController.logout);
router.get(
  "/me",
  authMiddleware,
  (req, res) => void res.status(200).json({ user: req.user })
);

export default router;
