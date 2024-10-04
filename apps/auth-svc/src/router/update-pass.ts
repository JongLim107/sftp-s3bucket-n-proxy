import { Request, Response, Router } from "express";
import {
  AuthorizationError,
  BadRequestHandler,
  compressAndEncodeBase64,
  HttpClient,
  logger,
  redisGet,
} from "@sftp-s3bucket-n-proxy/shared";
import { header } from "express-validator";

const validateRequest = [
  header("kid").isString().withMessage("kid is missing").bail(),
  header("authorization").isString().withMessage("authorization token is missing").bail(),
  BadRequestHandler,
];

const updatePassRouter = Router();
updatePassRouter.post("/", validateRequest, async (req: Request, res: Response) => {
  // authorize the request authorization token
  const { kid, authorization } = req.headers;
  const token = authorization.replace("Bearer ", "");
  const token2 = await redisGet(kid as string);
  if (token !== token2) {
    logger.error("Authorization token mismatch, " + token + " " + token2);
    return res.status(401).send(new AuthorizationError());
  }

  // update the special pass
  const passSvcUrl = `${process.env.PASS_SVC_URL}/api/v1`;
  const compressedBody = compressAndEncodeBase64(req.body);
  const resp = await HttpClient().post(
    `${passSvcUrl}/updateSpecialPass`,
    { b64string: compressedBody },
    { headers: { "Accept-Encoding": "gzip,deflate", "content-type": "text/plain" } },
  );

  res.status(resp.status).send(resp.data);
});

export default updatePassRouter;
