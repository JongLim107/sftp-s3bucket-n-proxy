import { CronJob } from "cron";
import { handler } from "./sync-file-handler";
import { logger } from "@sftp-s3bucket-n-proxy/shared";

export const setupCronJob = () => {
  [
    [process.env.CRON_SCHEDULE_SGWP, process.env.SSH_USER_SGWP],
    [process.env.CRON_SCHEDULE_CPC, process.env.SSH_USER_CPC],
    [process.env.CRON_SCHEDULE_IWPS, process.env.SSH_USER_IWPS],
    [process.env.CRON_SCHEDULE_RDIEP, process.env.SSH_USER_RDIEP],
  ]
    .filter((cronCfg) => cronCfg.every((value) => !!value))
    .forEach(([schedule, sshUser]) => {
      logger.info(`Starting cron job with schedule: ${schedule}, sshUser: ${sshUser}`);
      return new CronJob(
        schedule,
        async () => await handler(sshUser),
        null, // onComplete
        true, // start
        "Asia/Singapore",
      );
    });
};
