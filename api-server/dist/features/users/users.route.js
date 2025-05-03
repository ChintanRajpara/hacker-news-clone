"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = __importDefault(require("./users.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimiter_1 = require("../../utils/rateLimiter");
const router = (0, express_1.Router)();
router.post("/signup", rateLimiter_1.authLimiter, users_controller_1.default.signup);
router.post("/login", rateLimiter_1.authLimiter, users_controller_1.default.login);
router.post("/logout", rateLimiter_1.authLimiter, users_controller_1.default.logout);
router.get("/me", auth_middleware_1.authMiddleware, (req, res) => void res.status(200).json({ user: req.user }));
exports.default = router;
