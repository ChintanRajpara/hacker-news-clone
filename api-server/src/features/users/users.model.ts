import { Schema, model } from "mongoose";

export interface IUser {
  id: string;
  email: string;
  name: string;
}

const usersModel = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
});

export default model("Users", usersModel);
