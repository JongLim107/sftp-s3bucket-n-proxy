import { validateRequest } from "../../validator/source-system-validator";

describe("validateRequest", () => {
  const req = {
    originalUrl: "/api",
    headers: {
      "x-api-key": "12345",
      "x-api-secret": "abcdef",
    },
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    json: jest.fn(),
  };
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call next if the request is valid", () => {
    process.env.SOURCE_SYSTEM_CONFIG = JSON.stringify({
      [req.originalUrl]: req.headers,
    });

    validateRequest(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should return an error if the request is missing API key or secret", () => {
    process.env.SOURCE_SYSTEM_CONFIG = JSON.stringify({
      [req.originalUrl.replace("/", "")]: req.headers,
    });

    req.headers["x-api-key"] = "54321";

    validateRequest(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      errors: {
        message: "API key or secret is missing/invalid",
        fields: ["x-api-key"],
      },
    });
  });

  it("should return an error if the request is invalid (env don't have the secret-pair)", () => {
    process.env.SOURCE_SYSTEM_CONFIG = "";

    validateRequest(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Internal Server Error");
  });
});
