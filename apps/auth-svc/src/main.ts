import "dotenv/config";
import app, { appRoute } from "./app";
import { logger } from "@sftp-s3bucket-n-proxy/shared";

const port = Number(process.env.SVC_PORT) || 3012;
const server = app.listen(port, () => {
  logger.info(`Auth svc listening at ${process.env.BASE_URL}${appRoute} port: ${port}`);
});
server.on("error", logger.error);
