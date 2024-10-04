import * as crypto from "crypto";
import { EncryptedText, stripEnd } from "./encrypted-text";
import logger from "../logger";

const aesEncrypt = (key: string | Uint8Array, data: string, alias?: string) => {
  try {
    const key64 = typeof key === "string" ? Buffer.from(key, "base64") : key;
    const cipher = crypto.createCipheriv("aes-256-ecb", key64, null);

    const cryptedBytes = cipher.update(data);
    const enc = Buffer.concat([cryptedBytes, cipher.final()]);
    let encrypted = enc.toString("base64");
    encrypted = stripEnd(encrypted, "=");
    if (alias) {
      return new EncryptedText(alias, encrypted);
    }
    return encrypted;
  } catch (e) {
    logger.error(`aesEncrypt (${key}) | ${e}`);
    return null;
  }
};

export const encryptRequestId = (data: string): string | null => {
  try {
    const key = process.env.KR00;
    return aesEncrypt(key, data) as string;
  } catch (error) {
    logger.error("failed to aesEncrypt request id");
    return null;
  }
};
