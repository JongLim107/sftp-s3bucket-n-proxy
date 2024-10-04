import express from "express";
import authRouter from "./router/auth";
import updatePassRouter from "./router/updatePass";

const app = express();

const urlPrefix = process.env.SVC_URL_PREFIX || "sgwp";

export const appRoute = `/${urlPrefix}/intranet/auth-svc/api/v1`;

app.use(`${appRoute}/healthz`, (req, res) => {
  res.status(200).send("OK");
});

app.use(`${appRoute}/auth`, authRouter);
app.use(`${appRoute}/updatePass`, updatePassRouter);

export default app;
