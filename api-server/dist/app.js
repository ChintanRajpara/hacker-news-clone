"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const users_1 = require("./features/users");
const error_handlers_middleware_1 = __importDefault(require("./middleware/error-handlers.middleware"));
const posts_1 = require("./features/posts");
const requestLogger_1 = require("./middleware/requestLogger");
const comments_1 = require("./features/comments");
const auth_middleware_1 = require("./middleware/auth.middleware");
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use((0, cors_1.default)({ origin: process.env.ALLOWED_ORIGIN, credentials: true }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(requestLogger_1.requestLogger);
app.use(auth_middleware_1.tokenParserMiddleware);
app.use("/api/users", users_1.users);
app.use("/api/posts", posts_1.posts);
app.use("/api/comments", comments_1.comments);
app.get("/", (_, res) => void res.send("API Server for Hacker News Clone!"));
// must be at last
app.use(error_handlers_middleware_1.default);
db_1.connectDB.then(() => {
    app.listen(port, () => console.log(`API Server listening on port ${port}`));
});
