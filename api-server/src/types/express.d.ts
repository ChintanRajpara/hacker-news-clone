import { IUser } from "../features/users/users.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // This will add the user property to the Request object
    }
  }
}
