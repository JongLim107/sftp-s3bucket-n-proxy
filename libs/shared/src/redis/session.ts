import RedisStore from "connect-redis";
import { v4 as uuid_v4 } from "uuid";
import { initRedisClient } from "./index";

export const getSessionCfg = (
  secret = process.env.EXPRESS_SESSION_SECRET || "session_secret",
  redisClient = initRedisClient(),
) => ({
  secret,
  resave: false,
  saveUninitialized: true,
  genid: () => uuid_v4(),
  store: new RedisStore({
    client: redisClient,
    prefix: "sessions:",
  }),
});
