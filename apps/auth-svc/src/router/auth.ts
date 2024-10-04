import { Router } from "express";
import { body, header } from "express-validator";
import { BadRequestHandler, logger, redisSet, TechnicalError } from "@sftp-s3bucket-n-proxy/shared";
import { getJWToken } from "../service/kms-auth";

const validateRequest = [
  header("kid").isString().withMessage("kid is required").bail(),
  body("api-key")
    .custom((value) => value === "tmp-sample-key")
    .withMessage("api-key is invalid")
    .bail(),
  body("secret-key")
    .custom((value) => value === "tmp-sample-secret")
    .withMessage("secret-key is invalid")
    .bail(),
  BadRequestHandler,
];

const authRouter = Router();
authRouter.post("/", validateRequest, async (req, res) => {
  try {
    const { kid } = req.headers;
    const jwt = await getJWToken(kid);
    await redisSet(kid, jwt);
    res.status(200).send(jwt);
  } catch (err) {
    logger.error(err);
    // overide the error message to "Internal Server Error"
    res.status(500).send(new TechnicalError());
  }
});

export default authRouter;
