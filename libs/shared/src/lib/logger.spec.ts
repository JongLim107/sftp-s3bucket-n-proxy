import libs from "./logger";

describe("logger", () => {
  it("should work", () => {
    expect(libs.debug).toEqual("libs");
  });
});
