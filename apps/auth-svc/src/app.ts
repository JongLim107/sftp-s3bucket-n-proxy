import express from "express";
import httpContext from "express-http-context";
import session from "express-session";
import ruid from "express-ruid";
import helmet from "helmet";
import { getSessionCfg, requestContextMiddleware } from "@sftp-s3bucket-n-proxy/shared";
import authRouter from "./router/auth";
import updatePassRouter from "./router/update-pass";
import dynamicRouter from "./router/dynamic-router";

const app = express();
app.use(express.json());

app.use(helmet());

app.use(httpContext.middleware);
app.use(ruid({ setInContext: true }));
app.use([requestContextMiddleware]);

app.use(session(getSessionCfg()));

export const appRoute = process.env.API_KEY_PROXY_FORWARD_BASE_ROUTE;

app.use(`${appRoute}/healthz`, (req, res) => {
  res.status(200).send("OK");
});

// these routes are for the lambda approach, disable them for now
const lambda_approach = false;
if (!lambda_approach) {
  app.use(`${appRoute}/auth`, authRouter);
  app.use(`${appRoute}/update-pass`, updatePassRouter);
}

// this is for backward compatibility
if (process.env.FORWARD_PROXY_BASE_ROUTE && process.env.SOURCE_SYSTEM_CONFIG) {
  app.use(`${appRoute}/`, dynamicRouter);
}

export default app;
