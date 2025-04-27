import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If the error is an instance of Error, send the message
  if (err instanceof Error) {
    res.status(500).json({ message: err.message });

    return;
  }

  // If the error is not an instance of Error, send a static message
  res.status(500).json({ message: "An unexpected error occurred" });
};

export default errorHandler;
