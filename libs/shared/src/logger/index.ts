import moment from "moment";
import winston, { format } from "winston";
import httpContext from "express-http-context";
import { getHttpContext } from "../request";

const logFormat = format.printf((infoObj) => {
  const requestId = httpContext.get("rid") || getHttpContext().get("rid");
  const requestIdStr = requestId ? ` [requestID: ${requestId}]` : "";

  return `[${moment().format("YYYY-MM-DD HH:mm:ss.SSS")}] [sgwp] [${infoObj.level}]${requestIdStr} ${infoObj.message}`;
});

const defaultOptions = {
  format: format.combine(format.splat(), logFormat),
  level: "info",
};

const logger = winston.createLogger({
  ...defaultOptions,
  level: process.env.DEBUG_MODE === "true" ? "debug" : "info",
  transports: [new winston.transports.Console()],
});

const log = <T>(level: string, message: string | unknown | object, meta: T[]): void => {
  logger.log(level, message as string, ...meta);
};

const debug = <T>(message: string | unknown | object, ...meta: T[]): void => {
  log("debug", message, meta);
};

const info = <T>(message: string | unknown | object, ...meta: T[]): void => {
  log("info", message, meta);
};

const warn = <T>(message: string | unknown | object, ...meta: T[]): void => {
  log("warn", message, meta);
};

const error = <T>(message: string | unknown | object, ...meta: T[]): void => {
  log("error", message, meta);
};

export default {
  debug,
  info,
  warn,
  error,
};
