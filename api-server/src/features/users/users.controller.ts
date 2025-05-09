import { Request, Response } from "express";
import usersModel, { IUser } from "./users.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
class UsersController {
  private static instance: UsersController;

  private constructor() {
    // Bind methods to the class instance
    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  public static getInstance(): UsersController {
    if (!UsersController.instance) {
      UsersController.instance = new UsersController();
    }
    return UsersController.instance;
  }

  async signup(req: Request, res: Response) {
    const { name, password } = req.body;

    const email = String(req.body.email).toLowerCase();

    const existingUser = await usersModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists." });
      return; // You can break out early after sending the response
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await usersModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name } as IUser,
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // or "none" if using HTTPS
      secure: false, // true only if using HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // optional expiry
    });

    res.status(201).json({ message: "User created successfully." });
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await usersModel.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid credentials." });
      return;
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name } as IUser,
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // or "none" if using HTTPS
      secure: false, // true only if using HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // optional expiry
    });

    res.status(200).json({ message: "Logged in successfully." });
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully." });
  }
}

export default UsersController.getInstance();
