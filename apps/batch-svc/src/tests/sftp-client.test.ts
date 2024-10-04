import { Readable } from "stream";
import { SftpClient } from "../sftp-client/index"; // Update the import path as necessary
import { removeFilenameFromPath } from "../utils/path";
import { logger } from "@sftp-s3bucket-n-proxy/shared";

const _innerSftp = {
  connect: jest.fn().mockImplementation(() => Promise.resolve()),
  list: jest.fn().mockResolvedValue([{ type: "-", name: "file1.txt" }]),
  mkdir: jest.fn().mockResolvedValue(true),
  createReadStream: jest.fn().mockReturnValue(new Readable()),
  fastPut: jest.fn().mockResolvedValue(true),
  put: jest.fn().mockResolvedValue(true),
  delete: jest.fn().mockResolvedValue(true),
  end: jest.fn().mockResolvedValue(true),
};

jest.mock("ssh2-sftp-client", () => {
  return jest.fn().mockImplementation(() => _innerSftp);
});

describe("SftpClient", () => {
  let sftpClient: SftpClient;

  beforeAll(async () => {
    sftpClient = new SftpClient();
    await sftpClient.connect("sftpuser");
    jest.spyOn(logger, "error").mockReturnValue();
    jest.spyOn(logger, "info").mockReturnValue();
  });

  afterAll(async () => {
    await sftpClient.close();
    jest.restoreAllMocks();
  });

  it("should return the SftpClient instance from connect", async () => {
    const customClient = new SftpClient();

    const instance = await customClient.connect("sftpuser");
    expect(instance).toBe(customClient);
    expect(logger.info).toHaveBeenCalledWith(">>>> Connecting to SFTP server sftpuser");
  });

  it("should throw an error if connection fails", async () => {
    _innerSftp.connect.mockImplementation(() => Promise.reject(Error("Connection failed")));
    const customClient = new SftpClient();

    await expect(customClient.connect("sftpuser")).rejects.toThrow("Connection failed");

    expect(logger.error).toHaveBeenCalledWith("<<<< Connection failed", expect.any(Error));
  });

  it("should list files in the specified path", async () => {
    const result = await sftpClient.listFiles("/upload");
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0]).toBe("file1.txt");
  });

  it("should create a directory", async () => {
    await expect(sftpClient.mkdirs("/new-directory")).resolves.toBe(true);
  });

  it("should handle error when mkdir fails and folder does not already exist", async () => {
    const remotePath = "/new-directory";
    const errorMessage = "Some other error";
    jest.spyOn(_innerSftp, "mkdir").mockRejectedValueOnce(new Error(errorMessage));

    await expect(sftpClient.mkdirs(remotePath)).rejects.toThrow(errorMessage);

    expect(_innerSftp.mkdir).toHaveBeenCalledWith(removeFilenameFromPath(remotePath), true);
  });

  it("should create a readable stream from a file path", async () => {
    const path = "/remote/path/file.txt";
    const mockStream = new Readable();
    jest.spyOn(_innerSftp, "createReadStream").mockReturnValue(mockStream);

    const result = await sftpClient.createReadStream(path);

    expect(_innerSftp.createReadStream).toHaveBeenCalledWith(path, {
      flags: "r",
      mode: 0o666,
      autoClose: true,
    });
    expect(result).toBe(mockStream);
  });

  it("should upload a file", async () => {
    await expect(sftpClient.uploadFile("local/path/to/file.txt", "/remote/path/file.txt")).resolves.toBe(true);
  });

  it("should put a stream to the remote path", async () => {
    const input = new Readable();
    const remotePath = "/remote/path/file.txt";
    jest.spyOn(sftpClient, "mkdirs").mockResolvedValue("true");
    jest.spyOn(_innerSftp, "put").mockResolvedValue(true);

    await expect(sftpClient.putStream(input, remotePath)).resolves.toBe(true);

    expect(sftpClient.mkdirs).toHaveBeenCalledWith(remotePath);
    expect(_innerSftp.put).toHaveBeenCalledWith(input, remotePath);
  });

  it("should delete a file", async () => {
    await expect(sftpClient.deleteFile("/remote/path/file.txt")).resolves.toBe(true);
  });

  it("should close the SFTP connection", async () => {
    jest.spyOn(_innerSftp, "end").mockResolvedValue(true);

    await sftpClient.close();

    expect(_innerSftp.end).toHaveBeenCalled();
  });
});
