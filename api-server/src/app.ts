import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { users } from "./features/users";
import errorHandler from "./middleware/error-handlers.middleware";
import { posts } from "./features/posts";
import { requestLogger } from "./middleware/requestLogger";
import { comments } from "./features/comments";
import { tokenParserMiddleware } from "./middleware/auth.middleware";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.use(tokenParserMiddleware);

app.use("/api/users", users);
app.use("/api/posts", posts);
app.use("/api/comments", comments);

app.get("/", (_, res) => void res.send("API Server for Hacker News Clone!"));

// must be at last
app.use(errorHandler);

export default app;
