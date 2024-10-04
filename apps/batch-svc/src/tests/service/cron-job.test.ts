import * as cron from "cron";
import { setupCronJob } from "../../service/cron-job";
import * as SyncHandler from "../../service/sync-file-handler";

describe("setupCronJob", () => {
  let cronJobSpy: jest.SpyInstance;
  let jobHandlerSpy: jest.SpyInstance;

  beforeAll(async () => {
    jobHandlerSpy = jest.spyOn(SyncHandler, "handler").mockReturnValue(null);
    cronJobSpy = jest.spyOn(cron, "CronJob").mockImplementation((arg1, handler: () => void, ...args) => {
      handler();
      return jest.fn()(...args);
    });
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  it("should throw an error when the path is invalid", async () => {
    setupCronJob();

    expect(cronJobSpy).toHaveBeenNthCalledWith(1, "*/15 * * * *", expect.any(Function), null, true, "Asia/Singapore");

    expect(jobHandlerSpy).toHaveBeenCalledWith("cpc_user");
  });
});
