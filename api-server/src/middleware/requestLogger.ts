import morgan from "morgan";
import logger from "../utils/logger";
import { Request } from "express";

morgan.token("body", (req: Request) => JSON.stringify(req.body));

export const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }
);
