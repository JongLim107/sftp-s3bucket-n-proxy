import { removeFilenameFromPath, getFilenameFromPath, convertToS3Prefix } from "../../utils/path";

describe("removeFilenameFromPath", () => {
  it("should remove the filename from the path", () => {
    const path = "/batch-svc/src/utils/filename.ts";
    const expected = "/batch-svc/src/utils";

    const result = removeFilenameFromPath(path);

    expect(result).toEqual(expected);
  });

  it("should handle paths without filenames", () => {
    const path = "/batch-svc/src/utils";
    const expected = "/batch-svc/src";

    const result = removeFilenameFromPath(path);

    expect(result).toEqual(expected);
  });
});

describe("getFilenameFromPath", () => {
  it("should return the filename from the path", () => {
    const path = "/batch-svc/src/utils/filename.ts";
    const expected = "filename.ts";

    const result = getFilenameFromPath(path);

    expect(result).toEqual(expected);
  });

  it("should handle paths without filenames", () => {
    const path = "/batch-svc/src/utils";
    const expected = "utils";

    const result = getFilenameFromPath(path);

    expect(result).toEqual(expected);
  });

  it("should handle empty paths", () => {
    const path = "";

    const result = getFilenameFromPath(path);

    expect(result).toEqual(path);
  });
});

describe("convertToS3Prefix", () => {
  it.each(["/batch-svc/src/utils", "/batch-svc/src/utils/", "batch-svc/src/utils", "batch-svc//src/utils"])(
    "should convert the path to S3 format",
    (path) => {
      const expected = "batch-svc/src/utils";

      const result = convertToS3Prefix(path);

      expect(result).toEqual(expected);
    },
  );
});
