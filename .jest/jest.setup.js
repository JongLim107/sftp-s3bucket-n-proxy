require("dotenv").config();

jest.mock("winston", () => {
  const actual = jest.requireActual("winston");
  return {
    ...actual,
    createLogger: jest.fn(() => ({
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
    })),
  };
});
