import "dotenv/config";
import app, { appRoute } from "./app";
import { logger } from "@sftp-s3bucket-n-proxy/shared";

const port = Number(process.env.SVC_PORT) || 3011;
const server = app.listen(port, () => {
  logger.info(`Batch svc listening at ${process.env.BASE_URL}${appRoute}`);
});
server.on("error", logger.error);
