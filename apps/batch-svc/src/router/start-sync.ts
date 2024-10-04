import { Router } from "express";
import { check, validationResult } from "express-validator";
import { handler } from "../service/sync-file-handler";

const validateRequest = [
  check("username").exists().withMessage("Username is required"),
  check("Authorization")
    .exists()
    .withMessage("Authorization token is required")
    .bail()
    .custom((value, { req }) => {
      if (!req.headers.authorization) {
        throw new Error("Authorization token is missing");
      } else if (req.headers.authorization.replace("Bearer ", "") !== process.env.MANUAL_TICK_TOKEN) {
        // debugging route, use the private key as the token
        throw new Error("Authorization token is invalid");
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const tickRouter = Router();
tickRouter.use("/start-sync", validateRequest, async (req, res) => {
  if (Array.isArray(req.query.username)) {
    req.query.username.forEach((user) => handler(user));
  } else {
    await handler(req.query.username);
  }
  res.status(200).send("Triggered");
});

export default tickRouter;
