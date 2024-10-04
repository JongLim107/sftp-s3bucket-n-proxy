import express from "express";
import tickRoute from "../router/start-sync";
import { setupCronJob } from "../service/cron-job";

const app = express();

const urlPrefix = process.env.SVC_URL_PREFIX || "sgwp";

export const appRoute = `/${urlPrefix}/intranet/batch-svc/api/v1`;

app.use(`${appRoute}/healthz`, (req, res) => {
  res.status(200).send("OK");
});

if (process.env.ENABLE_MANUAL_TICK === "true") {
  app.use(`${appRoute}/`, tickRoute);
}

setupCronJob();

export default app;
