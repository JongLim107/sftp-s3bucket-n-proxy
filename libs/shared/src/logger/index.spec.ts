import logger from "./index";

describe("logger", () => {
  beforeEach(() => {
    // Mock any necessary dependencies or setup
  });

  afterEach(() => {
    // Clean up any mocks or reset any necessary state
  });

  it("should log a debug message", () => {
    const debugSpy = jest.spyOn(logger, "debug");
    const message = "Debug message";
    const meta = ["meta1", "meta2"];

    logger.debug(message, ...meta);

    expect(debugSpy).toHaveBeenCalledWith(message, ...meta);
  });

  it("should log an info message", () => {
    const infoSpy = jest.spyOn(logger, "info");
    const message = "Info message";
    const meta = ["meta1", "meta2"];

    logger.info(message, ...meta);

    expect(infoSpy).toHaveBeenCalledWith(message, ...meta);
  });

  it("should log a warn message", () => {
    const warnSpy = jest.spyOn(logger, "warn");
    const message = "Warn message";
    const meta = ["meta1", "meta2"];

    logger.warn(message, ...meta);

    expect(warnSpy).toHaveBeenCalledWith(message, ...meta);
  });

  it("should log an error message", () => {
    const errorSpy = jest.spyOn(logger, "error");
    const message = "Error message";
    const meta = ["meta1", "meta2"];

    logger.error(message, ...meta);

    expect(errorSpy).toHaveBeenCalledWith(message, ...meta);
  });
});
