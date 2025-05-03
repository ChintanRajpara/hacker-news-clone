"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comments_controller_1 = __importDefault(require("./comments.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rateLimiter_1 = require("../../utils/rateLimiter");
const router = (0, express_1.Router)();
router.post("/", rateLimiter_1.writeLimiter, auth_middleware_1.authMiddleware, comments_controller_1.default.createComment);
router.put("/:commentId", rateLimiter_1.writeLimiter, auth_middleware_1.authMiddleware, comments_controller_1.default.updateComment);
router.delete("/:commentId", rateLimiter_1.writeLimiter, auth_middleware_1.authMiddleware, comments_controller_1.default.deleteComment);
router.get("/:postId", rateLimiter_1.readLimiter, comments_controller_1.default.getComments);
exports.default = router;
