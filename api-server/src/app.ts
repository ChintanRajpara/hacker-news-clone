import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { connectDB } from "./config/db";
import cookieParser from "cookie-parser";
import { users } from "./features/users";
import errorHandler from "./middleware/error-handlers.middleware";
import { posts } from "./features/posts";

const app = express();
const port = process.env.PORT;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/users", users);
app.use("/api/posts", posts);

app.get("/", (req, res) => {
  res.send("API Server for Hacker News Clone!");
});

app.use(errorHandler);

connectDB.then(() => {
  app.listen(port, () =>
    console.log(`server running at http://localhost:${port}`)
  );
});
