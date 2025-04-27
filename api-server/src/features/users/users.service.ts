import Users from "./users.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

export const signupUser = async (
  name: string,
  email: string,
  password: string
) => {
  const existingUser = await Users.findOne({ email });
  if (existingUser) {
    throw new Error("Email already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await Users.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await Users.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  // Create JWT Token
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

  return token;
};

export const logoutUser = async () => {
  // Nothing much in service, handled in controller by clearing cookie
  return true;
};
