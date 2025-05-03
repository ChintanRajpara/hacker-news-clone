"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.tokenParserMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const tokenParserMiddleware = (req, _res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = decoded;
        }
        catch (_a) {
            // Ignore invalid tokens silently
            req.user = undefined;
        }
    }
    next(); // Always proceed
};
exports.tokenParserMiddleware = tokenParserMiddleware;
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res
            .status(401)
            .json({ message: "Unauthorized access. Token is required." });
        return;
    }
    if (!req.user) {
        res
            .status(401)
            .json({ message: "Invalid or expired token. Please log in again." });
        return;
    }
    next();
};
exports.authMiddleware = authMiddleware;
