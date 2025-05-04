import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../features/users/users.model";
import dotenv from "dotenv";

dotenv.config();

export const tokenParserMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET ?? "your_jwt_secret_key"
      ) as IUser;
      req.user = decoded;
    } catch {
      // Ignore invalid tokens silently
      req.user = undefined;
    }
  }

  next(); // Always proceed
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
