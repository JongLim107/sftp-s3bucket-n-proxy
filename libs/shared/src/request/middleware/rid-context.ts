import { createNamespace, Namespace } from "cls-hooked";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

let namespace: Namespace = null;

// Function to get the current context
export const getHttpContext = () => {
  if (!namespace) {
    namespace = createNamespace(`context-${uuidv4()}`);
  }
  return namespace;
};

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  getHttpContext().run(() => namespace.set("rid", req.headers["rid"] || uuidv4()));
  next();
};
