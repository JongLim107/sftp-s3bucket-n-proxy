import request from "supertest";
import * as sharedModule from "@sftp-s3bucket-n-proxy/shared";
import app from "../../app";

describe("dynamic router", () => {
  afterAll(sharedModule.closeRedisClient);

  const dynamicRoutes = Object.keys(JSON.parse(process.env.SOURCE_SYSTEM_CONFIG));
  const post = jest.fn().mockReturnValue({ status: 200, data: "sample-data" });
  const secretPair = { "x-sgwp-apikey": "test-api-key", "x-sgwp-apisecret": "test-api-secret" };

  beforeEach(() => {
    jest.spyOn(sharedModule, "HttpClient").mockReturnValue({ post } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each(dynamicRoutes)("should return 200 OK when passing in a valid body for route: %s", async (routeName) => {
    const incomingUrl = process.env.API_KEY_PROXY_FORWARD_BASE_ROUTE + routeName;
    const outgoingUrl = process.env.FORWARD_PROXY_BASE_ROUTE + routeName;
    const outGoingHeaders = {
      "x-sgwp-nonce": expect.any(String),
      ...secretPair,
    };
    const body = { fin: "test-fin", passStatus: "Valid", passType: "16" };

    const response = await request(app)
      .post(incomingUrl)
      .set("x-sgwp-apikey", secretPair["x-sgwp-apikey"])
      .set("x-sgwp-apisecret", secretPair["x-sgwp-apisecret"])
      .send(body);

    expect(post).toHaveBeenCalledWith(outgoingUrl, body, { headers: expect.objectContaining(outGoingHeaders) });
    expect(response.status).toBe(200);
    expect(response.text).toBe("sample-data");
  });

  it.each(Object.keys(secretPair))("should return 401 when %s is missing/invalid", async (field) => {
    const index = Math.floor(Math.random() * 3);
    const incomingUrl = process.env.API_KEY_PROXY_FORWARD_BASE_ROUTE + dynamicRoutes[index];

    const missingField = Object.keys(secretPair).filter((key) => key !== field);
    const response = await request(app).post(incomingUrl).set(field, secretPair[field]).send();
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      errors: { fields: missingField, message: "API key or secret is missing/invalid" },
    });
  });

  it("should return error when is the outgoing request response error", async () => {
    post.mockRejectedValue({ status: 400, message: "Bad Request" });
    const index = Math.floor(Math.random() * 3);
    const incomingUrl = process.env.API_KEY_PROXY_FORWARD_BASE_ROUTE + dynamicRoutes[index];

    const response = await request(app)
      .post(incomingUrl)
      .set("x-sgwp-apikey", secretPair["x-sgwp-apikey"])
      .set("x-sgwp-apisecret", secretPair["x-sgwp-apisecret"])
      .send();
    expect(response.status).toBe(400);
    expect(response.text).toBe("Bad Request");
  });
});
