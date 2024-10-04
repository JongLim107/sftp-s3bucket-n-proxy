import { S3Client as S3 } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { S3Client } from "../s3-client";
import { logger } from "@sftp-s3bucket-n-proxy/shared";

jest.setTimeout(10000);

describe("CustomS3Client", () => {
  const s3Client = S3Client();
  const mockSend = jest.fn();
  S3.prototype.send = mockSend;

  const mockResult = {
    Contents: [{ Key: "file1" }, { Key: "file2" }],
  };

  beforeEach(() => {
    mockSend.mockClear();
    jest.spyOn(logger, "warn").mockReturnValue();
  });

  it("should delete files in the specified path", async () => {
    mockSend.mockResolvedValueOnce(mockResult);

    await s3Client.deleteFile("sample-bucket", "file1.txt");

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ input: { Bucket: "sample-bucket", Key: "file1.txt" } }),
    );
  });

  describe("listAllFiles", () => {
    it("should list all files in a bucket", async () => {
      mockSend.mockResolvedValueOnce(mockResult);

      const files = await s3Client.listAllFiles("sample-bucket", "/dir");

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: "sample-bucket",
            Prefix: "dir",
          },
        }),
      );
      expect(files).toEqual(["file1", "file2"]);
    });

    it.each([{}, { Contents: [] }])("should return empty array if the bucket is empty", async (response) => {
      mockSend.mockResolvedValueOnce(response);

      const files = await s3Client.listAllFiles("sample-bucket");

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith("No files found for Prefix: ");
      expect(files).toEqual([]);
    });

    it("should thrpw an error if there are too many files", async () => {
      mockSend.mockResolvedValueOnce({
        Contents: new Array(1000).fill({ Key: "file" }),
      });

      await expect(() => s3Client.listAllFiles("sample-bucket", "/dir")).rejects.toThrow(
        "Too many files found in Prefix: dir",
      );
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe("getDownloadStream", () => {
    it("should get a download stream for a file", async () => {
      mockSend.mockResolvedValueOnce({
        Body: "file content",
      });

      const stream = await s3Client.getDownloadStream("sample-bucket", "file1.txt");

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: "sample-bucket",
            Key: "file1.txt",
          },
        }),
      );
      expect(stream).toBeDefined();
    });

    it("should throw an error if the fails to get download stream", async () => {
      mockSend.mockResolvedValueOnce({});

      await expect(() => s3Client.getDownloadStream("sample-bucket", "file1.txt")).rejects.toThrow(
        "Failed to fetch file from s3: file1.txt",
      );
    });
  });

  it("should upload a file", async () => {
    mockSend.mockResolvedValueOnce({
      $metadata: {
        httpStatusCode: 200,
      },
    });

    const stream = createReadableStream("file content");
    await s3Client.uploadFile("sample-bucket", "file1.txt", stream);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Body: expect.any(Object),
          Bucket: "sample-bucket",
          Key: "file1.txt",
        },
      }),
    );
  });

  describe("moveFile", () => {
    it("should move a file", async () => {
      const deleteSpy = jest.spyOn(s3Client, "deleteFile");
      mockSend.mockResolvedValueOnce({
        $metadata: { httpStatusCode: 200 },
      });

      await s3Client.moveFile("sample-bucket", "src/file1.txt", "dest/file1.txt");

      expect(deleteSpy).toHaveBeenCalledWith("sample-bucket", "src/file1.txt");
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: "sample-bucket",
            CopySource: "sample-bucket/src%2Ffile1.txt",
            Key: "dest/file1.txt",
          },
        }),
      );
    });

    it("should throw an error if the copy operation fails", async () => {
      mockSend.mockResolvedValueOnce({
        $metadata: { httpStatusCode: 400 },
      });

      await expect(() => s3Client.moveFile("sample-bucket", "src/file1.txt", "dest/file1.txt")).rejects.toThrow(
        "Failed to copy file: src/file1.txt",
      );
    });
  });
});

describe("S3Client", () => {
  it("should create a new instance of CustomS3Client", async () => {
    const accessKeyId = "test-access-key";
    const secretAccessKey = "test-secret-key";
    process.env.AWS_ACCESS_KEY_ID = accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;

    const s3Client = S3Client();

    expect(s3Client).toBeInstanceOf(S3);
    const cfg = await s3Client.config.credentials();
    expect(cfg.accessKeyId).toBe(accessKeyId);
    expect(cfg.secretAccessKey).toBe(secretAccessKey);
  });
});

function createReadableStream(content: string): Readable {
  // Create a readable stream from the content
  // This is just a mock implementation for testing purposes
  // You can replace it with your own implementation if needed
  const stream = new Readable();
  stream.push(content);
  stream.push(null);
  return stream;
}
