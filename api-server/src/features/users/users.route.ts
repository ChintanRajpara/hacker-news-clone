import { Router } from "express";
import usersController from "./users.controller";

const router = Router();

router.post("/signup", usersController.signup);
router.post("/login", usersController.login);
router.post("/logout", usersController.logout);

export default router;
