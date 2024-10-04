import { S3Client } from "../s3-client";
import { SftpClient } from "../sftp-client";
import { logger } from "@sftp-s3bucket-n-proxy/shared";
import { getFilenameFromPath } from "../utils/path";

const suffixMap = new Map<string, string>([
  [process.env.SSH_USER_CPC, "cpc"],
  [process.env.SSH_USER_IWPS, "iwps"],
  [process.env.SSH_USER_RDIEP, "rdi-ep"],
]);

const getSftpToS3Paths = (sshUser: string) => {
  const pathMaps = JSON.parse(process.env.IN_FOLDER_PATHS || "{}");
  const suffix = suffixMap.get(sshUser);
  return Object.keys(pathMaps)
    .filter((key) => key.toLowerCase().includes(suffix))
    .map((key) => ({
      sftpPaths: key,
      s3Paths: pathMaps[key],
    }));
};

const getS3ToSftpPaths = (sshUser: string) => {
  const pathMaps = JSON.parse(process.env.OUT_FOLDER_PATHS || "{}");
  const suffix = suffixMap.get(sshUser);
  return Object.keys(pathMaps)
    .filter((key) => key.toLowerCase().includes(suffix))
    .map((key) => ({
      sftpPaths: pathMaps[key],
      s3Paths: key,
    }));
};

const uploadFilesToS3 = async (sftp: SftpClient, srcPath: string, dirPath: string) => {
  const s3Client = S3Client();
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const filenames = await sftp.listFiles(srcPath);
  logger.info(`sftp: ${JSON.stringify(filenames)}, ${srcPath} --> ${bucket + dirPath}`);
  await Promise.all(
    filenames.map(async (filename) => {
      const sftpFilePath = `${srcPath}/${filename}`;
      const s3FilePath = `${dirPath.replace("/", "")}/${filename}`;
      try {
        const stream = await sftp.createReadStream(sftpFilePath);
        await s3Client.uploadFile(bucket, s3FilePath, stream);
        await sftp.deleteFile(sftpFilePath);
      } catch (error) {
        logger.debug("Error in upload to s3 bucket", error);
      }
    }),
  );
  logger.info("<< upload to s3 done");
};

const uploadFilesToSftp = async (sftp: SftpClient, srcPath: string, dirPath: string) => {
  const s3Client = S3Client();
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const filenames = await s3Client.listAllFiles(process.env.AWS_S3_BUCKET_NAME, srcPath);
  logger.info(`s3_bucket: ${JSON.stringify(filenames)}, ${bucket + srcPath} --> ${dirPath}`);
  await Promise.all(
    filenames.map(async (filePath) => {
      try {
        const filename = getFilenameFromPath(filePath);
        const stream = await s3Client.getDownloadStream(bucket, filePath);
        await sftp.putStream(stream, `${dirPath}/${filename}`);
        const backupPath = srcPath.split("/").slice(0, -1).join("/") + "/backup";
        await s3Client.moveFile(bucket, filePath, `${backupPath}/${filename}`);
      } catch (error) {
        logger.debug("Error in upload to sftp", error);
      }
    }),
  );
  logger.info("<< upload to sftp done");
};

export const handler = async (sshUser: string) => {
  const sftp = new SftpClient();
  await sftp.connect(sshUser);

  try {
    const paths = getSftpToS3Paths(sshUser);
    await Promise.all(paths.map((p) => uploadFilesToS3(sftp, p.sftpPaths, p.s3Paths)));
  } catch (error) {
    logger.error("Got error in listing sftp file", error);
  }

  try {
    const paths = getS3ToSftpPaths(sshUser);
    await Promise.all(paths.map((p) => uploadFilesToSftp(sftp, p.s3Paths, p.sftpPaths)));
  } catch (error) {
    logger.error("Got error in listing s3-bucket file", error);
  }

  await sftp.close();
};
