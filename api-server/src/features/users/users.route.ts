import { Router } from "express";
import usersController from "./users.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/signup", usersController.signup);
router.post("/login", usersController.login);
router.post("/logout", usersController.logout);
router.get(
  "/me",
  authMiddleware,
  (req, res) => void res.status(200).json({ user: req.user })
);

export default router;
