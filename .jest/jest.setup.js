require("dotenv").config();

jest.spyOn(console, "debug").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "info").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});

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
