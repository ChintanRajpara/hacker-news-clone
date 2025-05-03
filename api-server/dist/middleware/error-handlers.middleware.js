"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (err, req, res, next) => {
    if (err instanceof Error) {
        logger_1.default.error(`Unhandled error at ${req.method} ${req.originalUrl}`, err);
        res.status(500).json({ message: err.message });
    }
    else {
        logger_1.default.error(`Unknown error at ${req.method} ${req.originalUrl}:`, {
            error: err,
        });
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.default = errorHandler;
