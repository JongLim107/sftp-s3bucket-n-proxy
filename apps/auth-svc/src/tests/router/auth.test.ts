import request from "supertest";
import { KMSClient } from "@aws-sdk/client-kms";
import { closeRedisClient, logger } from "@sftp-s3bucket-n-proxy/shared";
import app from "../../app";

const AWS_ACCESS_KEY_ID = "aws-s3-sccess-key-id";
const AWS_SECRET_ACCESS_KEY = "aws-s3-secret-access-key";

jest.mock("@aws-sdk/credential-providers", () => ({
  fromContainerMetadata: jest.fn(() => ({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  })),
}));

describe("auth Router", () => {
  const body = { "api-key": "tmp-sample-key", "secret-key": "tmp-sample-secret" };
  const spyKmsSend = jest.spyOn(KMSClient.prototype, "send");
  jest.spyOn(logger, "error").mockReturnValue();

  // close redis client after all tests
  afterAll(closeRedisClient);

  it("should return 200 OK when passing in valid request body", async () => {
    spyKmsSend.mockResolvedValue({ Signature: "sample-signature" } as never);
    const response = await request(app).post("/intranet/ext/api/v1/auth").set("kid", "sample-kid").send(body);
    expect(response.status).toBe(200);
    expect(response.text).toMatch(/^[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/);
  });

  it.each(Object.keys(body))("should return 400 when %s is missing/invalid", async (field) => {
    const hasField = Object.keys(body).filter((key) => key !== field)[0];
    const response = await request(app)
      .post("/intranet/ext/api/v1/auth")
      .set("kid", "sample-kid")
      .send({ [hasField]: body[hasField] });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      errors: [{ location: "body", msg: field + " is invalid", path: field, type: "field" }],
    });
  });

  it("should log error and response TechnicalError if not able to get JWT token", async () => {
    spyKmsSend.mockRejectedValue("something went wrong" as never);
    const response = await request(app).post("/intranet/ext/api/v1/auth").set("kid", "sample-kid").send(body);
    expect(response.status).toBe(500);
    expect(logger.error).toHaveBeenCalledWith("something went wrong");
    expect(response.body).toMatchObject({
      message: "Internal Server Error",
      type: "technical",
    });
  });
});
