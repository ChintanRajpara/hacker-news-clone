import { Request } from "express";
import { IUser } from "../features/users/users.model";

// add the user property to the Request object
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
