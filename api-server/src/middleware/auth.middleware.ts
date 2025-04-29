// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../features/users/users.model";

// Assuming that JWT secret is stored in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

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
    return; // In case of no token, we stop the request flow here.
  }

  try {
    // Verify the token and attach the decoded user to the request object
    const decoded = jwt.verify(token, JWT_SECRET) as IUser;
    req.user = decoded; // Add user data to the request object

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res
      .status(401)
      .json({ message: "Invalid or expired token. Please log in again." });
  }
};
