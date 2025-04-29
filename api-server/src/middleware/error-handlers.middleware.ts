import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof Error) {
    logger.error(`Unhandled error at ${req.method} ${req.originalUrl}`, err);

    res.status(500).json({ message: err.message });
  } else {
    logger.error(`Unknown error at ${req.method} ${req.originalUrl}:`, {
      error: err,
    });

    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default errorHandler;
