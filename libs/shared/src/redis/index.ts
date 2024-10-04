import Redis, { Cluster } from "ioredis";
import { TechnicalError } from "../index";
import logger from "../logger";

const defaultOpts = {
  host: process.env.REDIS_HOSTS || "localhost",
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

const createRedisClient = () => {
  if (process.env.REDIS_CLUSTER === "true") {
    return new Redis.Cluster([defaultOpts]);
  }
  return new Redis(defaultOpts);
};

let client: Cluster | Redis | null = null;

export const initRedisClient = () => {
  if (!client) {
    client = createRedisClient();
  }
  client.on("error", (err) => logger.error(`Redis:Failed to connect ${JSON.stringify(err)}`));
  client.on("reconnecting", () => logger.info("Redis:Reconnecting"));
  client.on("connecting", () => logger.info("Redis:Connecting"));
  client.on("connect", () => logger.info("Redis:Connected"));
  client.ping().catch(() => client.connect());
  return client;
};

export const closeRedisClient = () => {
  client?.disconnect();
  client = null;
};

export const redisSet = async (key: string, value: string, ttl?: number) => {
  const _client = initRedisClient();
  logger.info(`Setting info into redisDB for key: ${key}, value: ${value}, ttl: ${ttl}`);
  try {
    ttl != undefined ? await _client.set(key, value, "EX", ttl) : await _client.set(key, value);
  } catch (err) {
    logger.error(`redisSet Error: ${JSON.stringify(err)}`);
    closeRedisClient();
    throw new TechnicalError(`Error setting data for key: ${key}`);
  }
};

export const redisGet = async (key: string) => {
  const _client = initRedisClient();
  logger.info(`Getting info from redisDB for key: ${key}`);
  try {
    return await _client.get(key);
  } catch (err) {
    logger.error(`redisGet Error: ${err}`);
    closeRedisClient();
    throw new TechnicalError(`Error fetching data for key: ${key}`);
  }
};

export const redisDelete = async (key: string) => {
  const _client = initRedisClient();
  logger.info(`Deleting info from redisDB for key: ${key}`);
  try {
    return await _client.del(key);
  } catch (err) {
    logger.error(`redisDelete Error: ${JSON.stringify(err)}`);
    closeRedisClient();
    throw new TechnicalError(`Error deleting data for key: ${key}`);
  }
};
