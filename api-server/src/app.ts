import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { connectDB } from "./config/db";
import cookieParser from "cookie-parser";
import { users } from "./features/users";
import errorHandler from "./middleware/error-handlers.middleware";
import { posts } from "./features/posts";
import { requestLogger } from "./middleware/requestLogger";
import { comments } from "./features/comments";

const app = express();
const port = process.env.PORT;

app.use(cors({ origin: process.env.ALLOWED_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

app.use("/api/users", users);
app.use("/api/posts", posts);
app.use("/api/comments", comments);

app.get("/", (req, res) => {
  res.send("API Server for Hacker News Clone!");
});

// must be at last
app.use(errorHandler);

connectDB.then(() => {
  app.listen(port, () => console.log(`API Server listening on port ${port}`));
});
