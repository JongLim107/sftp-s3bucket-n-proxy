import sftp, { ConnectOptions } from "ssh2-sftp-client";
import { Readable } from "stream";
import { removeFilenameFromPath } from "../utils/path";
import { logger } from "@sftp-s3bucket-n-proxy/shared";

const defaultConfig = {
  host: process.env.SSH_HOST || "0.0.0.0",
  port: Number(process.env.SSH_PORT || "2222"),
  password: process.env.SSH_PASSWORD,
  privateKey: process.env.SSH_PRIVATE_KEY,
  passphrase: process.env.SSH_PASS_PHRASE,
  username: "sftpuser",
};

export class SftpClient {
  private _cfg: ConnectOptions;
  private _sftp: sftp;

  constructor(cfg: ConnectOptions = {}) {
    this._sftp = new sftp();
    this._cfg = { ...defaultConfig, ...cfg };
  }

  async connect(username: string) {
    logger.info(`>>>> Connecting to SFTP server ${username}`);
    await this._sftp.connect({ ...this._cfg, username }).catch((err) => {
      logger.error("<<<< Connection failed", err);
      throw err;
    });
    return this;
  }

  async listFiles(path: string) {
    const result = await this._sftp.list(path);
    return result.map(({ type, name }) => (type === "d" ? "/" : "") + name);
  }

  async mkdirs(remotePath: string) {
    const path = removeFilenameFromPath(remotePath);
    return this._sftp.mkdir(path, true);
  }

  async createReadStream(path: string): Promise<Readable> {
    return this._sftp.createReadStream(path, {
      flags: "r",
      mode: 0o666,
      autoClose: true,
    });
  }

  async uploadFile(localPath: string, remotePath: string) {
    await this.mkdirs(remotePath);
    return this._sftp.fastPut(localPath, remotePath);
  }

  async putStream(input: Readable, remotePath: string) {
    await this.mkdirs(remotePath);
    return this._sftp.put(input, remotePath);
  }

  async deleteFile(remoteFilePath: string) {
    return this._sftp.delete(remoteFilePath);
  }

  async close() {
    logger.info("<<<< Closing SFTP connection");
    this._sftp.end();
  }
}
