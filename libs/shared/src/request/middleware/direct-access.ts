import { NextFunction, Request, Response } from "express";
import { encryptRequestId } from "../../crypto";
import { StatusCode } from "..";
import logger from "../../logger";

export const directAccessValidation = (req: Request, res: Response, next: NextFunction) => {
  let rid = req.headers["rid"];
  let bffSignature = req.headers["bff-signature"];

  if (Array.isArray(rid)) {
    rid = rid[0];
  }
  if (Array.isArray(bffSignature)) {
    bffSignature = bffSignature[0];
  }

  if (
    rid &&
    bffSignature &&
    typeof rid === "string" &&
    typeof bffSignature === "string" &&
    verifySignature(rid, bffSignature)
  ) {
    next();
    return;
  }

  logger.warn("Request ID not found in headers");

  const allowedRoute = Array.prototype.concat(
    ["healthz"], // by default, healthz is allowed
    process.env.ROUTE_DIRECT_ACCESS,
  );
  const route = req.originalUrl.split("/");

  if (allowedRoute.includes(route[route.length - 1])) {
    // rid and bff signature not valid but route is allowed
    logger.info(`allowed route: ${req.originalUrl}`);
    next();
    return;
  }

  res.status(StatusCode.DIRECT_ACCESS_ERROR).send("Direct access not allowed");
};

export const createBffSignature = (rid: string | null | undefined) => {
  if (!rid) {
    return undefined;
  }
  const split = rid.split("/");
  const id = split[split.length - 1];
  return encryptRequestId(id);
};

const verifySignature = (rid: string, bffSignature: string) => {
  return createBffSignature(rid) === bffSignature;
};
