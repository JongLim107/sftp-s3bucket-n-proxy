import pako from "pako";
import logger from "../logger";

export const compressAndEncodeBase64 = <T>(data: T) => {
  try {
    const jsonString = JSON.stringify(data);
    const utf8Data = new TextEncoder().encode(jsonString);
    const compressedData = pako.gzip(utf8Data);
    const base64String = Buffer.from(compressedData).toString("base64");
    return base64String;
  } catch (e) {
    logger.error("failed to compress and encode payload", e);
    throw e;
  }
};
