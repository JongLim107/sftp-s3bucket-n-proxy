import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { StatusCode } from "../status-code";

export const BadRequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCode.BAD_REQUEST).json({ errors: errors.array() });
  }
  next();
};

export const UnauthorizedHandler = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCode.UNAUTHORISED).send("Unauthorized");
  }
  next();
};

export const TechnicalErrorHandler = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
  next();
};
