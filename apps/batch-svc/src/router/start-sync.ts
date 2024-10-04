import { Router } from "express";
import { check } from "express-validator";
import { BadRequestHandler } from "@sftp-s3bucket-n-proxy/shared";
import { handler } from "../service/sync-file-handler";

const validateRequest = [
  check("username").exists().withMessage("Username is required"),
  check("Authorization")
    .exists()
    .withMessage("Authorization token is missing")
    .bail()
    .custom((value, { req }) => {
      if (req.headers.authorization.replace("Bearer ", "") !== process.env.MANUAL_TICK_TOKEN) {
        // debugging route, use the private key as the token
        throw new Error("Authorization token is invalid");
      }
      return true;
    }),
  BadRequestHandler,
];

const tickRouter = Router();
tickRouter.post("/", validateRequest, async (req, res) => {
  if (Array.isArray(req.query.username)) {
    req.query.username.forEach((user) => handler(user));
  } else {
    await handler(req.query.username);
  }
  res.status(200).send("Triggered");
});

export default tickRouter;
