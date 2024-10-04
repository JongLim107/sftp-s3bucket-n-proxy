import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client as S3,
} from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { convertToS3Prefix } from "../utils/path";
import { Upload } from "@aws-sdk/lib-storage";
import { logger } from "@sftp-s3bucket-n-proxy/shared";

class CustomS3Client extends S3 {
  async deleteFile(bucket: string, fileName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: fileName,
    });
    await this.send(command);
  }

  /**
   * List all files in the bucket with the given prefix (only return first 1000 records)
   * @param bucket s3 bucket name
   * @param dirPath directory path in the bucket
   * @param prefix prefix of the file
   * @returns
   */
  async listAllFiles(bucket: string, dirPath?: string, prefix = ""): Promise<string[]> {
    const Prefix = dirPath ? convertToS3Prefix(`${dirPath}/${prefix}`) : prefix;
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix,
    });
    const { Contents } = await this.send(command);
    if (!Contents?.length) {
      logger.warn(`No files found for Prefix: ${Prefix}`);
      return [];
    }
    if (Contents.length === 1000) {
      throw new Error(`Too many files found in Prefix: ${Prefix}`);
    }
    return Contents.map((content) => content.Key).filter((name) => !name.endsWith("/"));
  }

  async getDownloadStream(bucket: string, fileName: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileName,
    });
    const response = await this.send(command);
    if (!response.Body) {
      throw new Error(`Failed to fetch file from s3: ${fileName}`);
    }

    return response.Body as Readable;
  }

  async uploadFile(bucket: string, s3FilePath: string, stream: Readable): Promise<void> {
    await new Upload({
      client: this,
      params: {
        Bucket: bucket,
        Key: s3FilePath,
        Body: stream,
      },
    }).done();
  }

  /**
   * @param bucket s3 bucket name
   * @param destPath is the file path in the bucket, include the filename
   * @param srcPath for the copy cmd, need to encode the filename in CopySource
   */
  async moveFile(bucket: string, srcPath: string, destPath: string): Promise<void> {
    const copyObjectCommand = new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${encodeURIComponent(srcPath)}`,
      Key: convertToS3Prefix(destPath),
    });

    const copyResult = await this.send(copyObjectCommand);
    if (copyResult.$metadata.httpStatusCode !== 200) {
      throw new Error(`Failed to copy file: ${srcPath}`);
    }
    await this.deleteFile(bucket, srcPath);
  }
}

export const S3Client = () =>
  new CustomS3Client({
    // region: "ap-east-1", // For locally testing with localstack
    // endpoint: "http://localhost:4566",
    // forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
