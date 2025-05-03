import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "../utils/logger";

dotenv.config();

//details from the env
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbPort = process.env.DB_PORT;

const dbUrl = `mongodb://${dbHost}:${dbPort}/${dbName}`;

//db connection
export const connectDB = mongoose
  .connect(dbUrl)
  .then((res) => {
    if (res) {
      console.log(`Database connection succeffully to ${dbName}`);
    }
  })
  .catch((err) => {
    logger.error(err);
    throw new Error("cannot connect to DB");
  });
