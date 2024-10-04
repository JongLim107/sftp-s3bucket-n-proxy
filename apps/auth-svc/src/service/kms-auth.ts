import { KMSClient, SignCommand } from "@aws-sdk/client-kms";
import { fromContainerMetadata } from "@aws-sdk/credential-providers";

let client: KMSClient | null = null;

const getClient = (): KMSClient => {
  if (!client) {
    client = new KMSClient({
      credentials: fromContainerMetadata({
        timeout: 5000,
        maxRetries: 2,
      }),
    });
  }
  return client;
};

const replaceSpecialChars = (b64string: string) => {
  return b64string.replace(/[=+/]/g, (charToBeReplaced: string) => {
    switch (charToBeReplaced) {
      case "=":
        return "";
      case "+":
      case "/":
        return "_";
    }
  });
};

/**
 * @param keyId AWS KMS account "Key Id"
 * @returns a signed JWT token, valid for 24 hours
 */
export const getJWToken = async (keyId: string) => {
  const header = { alg: "RS256", typ: "JWT", kid: keyId };
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // tomorrow
    iss: process.env.ISSUER,
    aud: process.env.AUDIENCE,
  };

  const base64_header = replaceSpecialChars(Buffer.from(JSON.stringify(header)).toString("base64"));
  const base64_payload = replaceSpecialChars(Buffer.from(JSON.stringify(payload)).toString("base64"));
  const value_to_sign = base64_header + "." + base64_payload;

  const command = new SignCommand({
    KeyId: keyId,
    Message: Buffer.from(value_to_sign),
    MessageType: "RAW",
    SigningAlgorithm: "RSASSA_PKCS1_V1_5_SHA_256",
  });
  const res = await getClient().send(command);
  const base64_signature = replaceSpecialChars(Buffer.from(res.Signature).toString("base64"));

  return value_to_sign + "." + base64_signature;
};
