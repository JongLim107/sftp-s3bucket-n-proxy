import { handler } from "../../service/sync-file-handler";
import { SftpClient } from "../../sftp-client";
import * as S3Module from "../../s3-client";
import { logger } from "@sftp-s3bucket-n-proxy/shared";

describe("handler", () => {
  // all env variables have been setted in set-env-vars.js
  const username = process.env.SSH_USER_CPC;
  const bucket = process.env.AWS_S3_BUCKET_NAME;

  const sftpMock = {
    connect: jest.fn(),
    close: jest.fn(),
    listFiles: jest.fn().mockReturnValue([]),
    createReadStream: jest.fn(),
    deleteFile: jest.fn(),
    putStream: jest.fn(),
  };

  const initialSpy = jest.spyOn(SftpClient, "initial");
  initialSpy.mockImplementation(() => sftpMock as any);

  const s3ClientMock = {
    listAllFiles: jest.fn().mockReturnValue([]),
    getDownloadStream: jest.fn(),
    moveFile: jest.fn(),
    uploadFile: jest.fn(),
  };

  beforeEach(() => {
    jest.spyOn(logger, "info").mockReturnValue();
    jest.spyOn(logger, "error").mockReturnValue();
    jest.spyOn(S3Module, "S3Client").mockReturnValue(s3ClientMock as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should establish sftp connection and close it in the end", async () => {
    await handler("testUser");

    expect(initialSpy).toHaveBeenCalledWith("testUser");
    expect(sftpMock.close).toHaveBeenCalled();

    // wrong user name should not invoke the s3 client
    expect(S3Module.S3Client).not.toHaveBeenCalled();
  });

  it("should establish sftp and s3 client given correct user name", async () => {
    await handler(username);

    expect(initialSpy).toHaveBeenCalledWith(username);
    expect(sftpMock.close).toHaveBeenCalled();

    expect(S3Module.S3Client).toHaveBeenCalledWith();
    expect(S3Module.S3Client).toHaveBeenCalledTimes(2);
  });

  it("should handle errors during listing files", async () => {
    sftpMock.listFiles.mockRejectedValueOnce(new Error("error1"));
    s3ClientMock.listAllFiles.mockRejectedValueOnce(new Error("error2"));

    await handler(username);

    expect(initialSpy).toHaveBeenCalledWith(username);
    expect(logger.error).toHaveBeenNthCalledWith(1, "Got error in listing sftp file", expect.any(Error));
    expect(logger.error).toHaveBeenNthCalledWith(2, "Got error in listing s3-bucket file", expect.any(Error));
    expect(sftpMock.close).toHaveBeenCalled();
  });

  it("should not even try to upload if fails to initial the sftp client", async () => {
    initialSpy.mockImplementationOnce(() => null as any);

    await handler("testUser");

    expect(initialSpy).toHaveBeenCalledWith("testUser");
    expect(sftpMock.close).not.toHaveBeenCalled();
    expect(S3Module.S3Client).not.toHaveBeenCalled();
  });

  describe("SFTP to S3", () => {
    it("should skip this folder if unable to list files for given path", async () => {
      sftpMock.listFiles.mockReturnValue(null);
      await handler(username);

      expect(sftpMock.listFiles).toHaveBeenCalledTimes(1);
      expect(sftpMock.listFiles).toHaveBeenCalledWith("/cpc/out");
      expect(s3ClientMock.uploadFile).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should allow SFTP to S3 upload partially success if unable to read some files", async () => {
      const mockFiles = ["file1", "file2"];
      sftpMock.listFiles.mockReturnValue(mockFiles);
      sftpMock.createReadStream.mockReturnValueOnce({});
      sftpMock.createReadStream.mockRejectedValueOnce(null);
      await handler(username);

      expect(sftpMock.listFiles).toHaveBeenCalledTimes(1);
      expect(sftpMock.listFiles).toHaveBeenCalledWith("/cpc/out");
      expect(logger.info).toHaveBeenNthCalledWith(2, `sftp: ["file1","file2"], /cpc/out --> sample-bucket/cpc/in`);

      expect(sftpMock.createReadStream).toHaveBeenCalledTimes(2);
      expect(s3ClientMock.uploadFile).toHaveBeenCalledTimes(1);
      expect(sftpMock.deleteFile).toHaveBeenCalledTimes(1);

      expect(logger.info).toHaveBeenNthCalledWith(3, "<< upload to s3 done");
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should process SFTP to S3 upload correctly", async () => {
      const mockFiles = ["file1", "file2"];
      sftpMock.listFiles.mockReturnValue(mockFiles);
      sftpMock.createReadStream.mockReturnValue({});
      await handler(username);

      expect(sftpMock.listFiles).toHaveBeenCalledTimes(1);
      expect(sftpMock.listFiles).toHaveBeenCalledWith("/cpc/out");
      expect(logger.info).toHaveBeenNthCalledWith(2, `sftp: ["file1","file2"], /cpc/out --> sample-bucket/cpc/in`);

      expect(sftpMock.createReadStream).toHaveBeenCalledTimes(2);
      expect(s3ClientMock.uploadFile).toHaveBeenCalledTimes(2);
      expect(sftpMock.deleteFile).toHaveBeenCalledTimes(2);
      mockFiles.forEach((file, index) => {
        expect(sftpMock.createReadStream).toHaveBeenNthCalledWith(index + 1, `/cpc/out/${file}`);
        expect(s3ClientMock.uploadFile).toHaveBeenNthCalledWith(index + 1, bucket, `cpc/in/${file}`, {});
        expect(sftpMock.deleteFile).toHaveBeenNthCalledWith(index + 1, `/cpc/out/${file}`);
      });

      expect(logger.info).toHaveBeenNthCalledWith(3, "<< upload to s3 done");
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe("S3 to SFTP", () => {
    it("should skip this folder if unable to list files for given path", async () => {
      s3ClientMock.listAllFiles.mockReturnValue(null);
      await handler(username);

      expect(s3ClientMock.listAllFiles).toHaveBeenCalledTimes(1);
      expect(s3ClientMock.listAllFiles).toHaveBeenCalledWith(bucket, "/cpc/out");
      expect(s3ClientMock.getDownloadStream).not.toHaveBeenCalled();
      expect(sftpMock.putStream).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should allow S3 to SFTP upload partially success if unable to read some files", async () => {
      const mockFiles = ["file1", "file2"];
      s3ClientMock.listAllFiles.mockReturnValue(mockFiles);
      s3ClientMock.getDownloadStream.mockReturnValueOnce({});
      s3ClientMock.getDownloadStream.mockRejectedValueOnce(null);
      await handler(username);

      expect(s3ClientMock.listAllFiles).toHaveBeenCalledTimes(1);
      expect(s3ClientMock.listAllFiles).toHaveBeenCalledWith(bucket, "/cpc/out");
      expect(logger.info).toHaveBeenNthCalledWith(5, `s3_bucket: ["file1","file2"], sample-bucket/cpc/out --> cpc/in`);

      expect(s3ClientMock.getDownloadStream).toHaveBeenCalledTimes(2);
      expect(sftpMock.putStream).toHaveBeenCalledTimes(1);
      expect(s3ClientMock.moveFile).toHaveBeenCalledTimes(1);

      expect(logger.info).toHaveBeenNthCalledWith(6, "<< upload to sftp done");
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should process S3 to SFTP upload correctly", async () => {
      const mockFiles = ["file1", "file2"];
      s3ClientMock.listAllFiles.mockReturnValue(mockFiles);
      s3ClientMock.getDownloadStream.mockReturnValue({});
      await handler(username);

      expect(s3ClientMock.listAllFiles).toHaveBeenCalledTimes(1);
      expect(s3ClientMock.listAllFiles).toHaveBeenCalledWith(bucket, "/cpc/out");
      expect(logger.info).toHaveBeenNthCalledWith(5, `s3_bucket: ["file1","file2"], sample-bucket/cpc/out --> cpc/in`);

      expect(s3ClientMock.getDownloadStream).toHaveBeenCalledTimes(2);
      expect(sftpMock.putStream).toHaveBeenCalledTimes(2);
      expect(s3ClientMock.moveFile).toHaveBeenCalledTimes(2);
      mockFiles.forEach((file, index) => {
        expect(s3ClientMock.getDownloadStream).toHaveBeenNthCalledWith(index + 1, bucket, file);
        expect(sftpMock.putStream).toHaveBeenNthCalledWith(index + 1, {}, `cpc/in/${file}`);
        expect(s3ClientMock.moveFile).toHaveBeenNthCalledWith(index + 1, bucket, file, `/cpc/backup/${file}`);
      });

      expect(logger.info).toHaveBeenNthCalledWith(6, "<< upload to sftp done");
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe("No sync path", () => {
    it("should cater for not configuring sync up paths cases", async () => {
      process.env.IN_FOLDER_PATHS = null;
      process.env.OUT_FOLDER_PATHS = undefined;

      await handler(username);

      expect(initialSpy).toHaveBeenCalledWith(username);
      expect(S3Module.S3Client).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenNthCalledWith(1, "Got error in listing sftp file", expect.any(TypeError));
      expect(logger.error).toHaveBeenNthCalledWith(2, "Got error in listing s3-bucket file", expect.any(SyntaxError));
      expect(sftpMock.close).toHaveBeenCalledWith();
    });

    it("should cater for not configuring sync up paths cases", async () => {
      process.env.IN_FOLDER_PATHS = "";
      process.env.OUT_FOLDER_PATHS = "";

      await handler(username);

      expect(initialSpy).toHaveBeenCalledWith(username);
      expect(S3Module.S3Client).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
      expect(sftpMock.close).toHaveBeenCalledWith();
    });
  });
});
