import request from "supertest";
import { closeRedisClient } from "@sftp-s3bucket-n-proxy/shared";
import app from "../app";

describe("app", () => {
  afterAll(closeRedisClient);

  it("should return 200 OK for health check endpoint", async () => {
    const response = await request(app).get("/intranet/ext/api/v1/healthz");
    expect(response.status).toBe(200);
    expect(response.text).toBe("OK");
  });

  it("should return 404 for non-existing endpoint under dynamicRouter", async () => {
    const response = await request(app).get("/non-existing-endpoint");
    expect(response.status).toBe(404);
  });
});
