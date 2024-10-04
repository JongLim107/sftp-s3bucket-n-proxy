import * as crypto from "crypto";
import logger from "../logger";
import moment from "moment-timezone";

// Set default timezone
moment.tz.setDefault("Asia/Singapore");

const NONCE_LENGTH = 25;
const SINGAPORE_TIMEZONE_OFFSET = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
const scramble: number[][] = [
  [7, 8, 5, 6, 13, 1, 12, 9, 11, 2, 10, 3, 4, 0],
  [5, 11, 12, 13, 1, 10, 3, 4, 8, 2, 0, 6, 9, 7],
  [6, 10, 3, 11, 8, 9, 7, 12, 2, 0, 5, 13, 1, 4],
  [8, 11, 1, 6, 9, 3, 0, 5, 12, 2, 4, 7, 10, 13],
  [7, 12, 10, 6, 2, 5, 0, 4, 3, 13, 8, 9, 1, 11],
  [0, 10, 1, 2, 11, 6, 5, 7, 9, 12, 13, 3, 8, 4],
  [2, 9, 11, 4, 13, 5, 8, 10, 7, 12, 6, 3, 1, 0],
  [8, 0, 1, 6, 12, 11, 4, 7, 3, 10, 9, 5, 13, 2],
  [0, 8, 6, 5, 10, 1, 12, 9, 2, 11, 13, 3, 4, 7],
  [7, 11, 2, 10, 0, 13, 4, 3, 8, 12, 1, 6, 9, 5],
];
const baseline: number = moment("2013-12-11", "YYYY-MM-DD").valueOf();

const scrambleTimestamp = (scrambleId: number, timestamp: number): string => {
  if (scrambleId < 0 || scrambleId >= scramble.length) {
    logger.error(`invalid scramble Id: ${scrambleId}`);
  }

  const tss = (timestamp - SINGAPORE_TIMEZONE_OFFSET - baseline).toString().padStart(14, "0");
  const sc = scramble[scramble.length - 1 - scrambleId];

  let sb = "";
  for (const i of sc) {
    sb += tss.charAt(i);
  }

  return sb;
};

const unscrambleTimestamp = (scrambleId: number, timestamp: string): string => {
  if (scrambleId < 0 || scrambleId >= scramble.length) {
    logger.error(`invalid scramble Id: ${scrambleId}`);
  }

  const ts = Array.from({ length: 14 }, () => "0");
  const sc = scramble[scramble.length - 1 - scrambleId];

  for (let i = 0; i < sc.length; ++i) {
    ts[sc[i]] = timestamp.charAt(i);
  }

  let rs = ts.join("");
  while (rs.startsWith("0")) {
    rs = rs.replace(/^0/, "");
  }

  return rs;
};

export const create = (offset?: number, scrambleId?: number, timestamp?: number) => {
  let secureRandom = crypto.randomBytes(2);
  const _scrambleId = scrambleId ?? secureRandom.readUInt16LE(0) % scramble.length;
  const _timestamp = timestamp ?? Date.now() + (offset || 0);

  secureRandom = crypto.randomBytes(2);
  const lpadding = secureRandom.readUInt16LE(0) % 10000;
  const rpadding = secureRandom.readUInt16LE(0) % 100000;

  const scrambledTimestamp = scrambleTimestamp(_scrambleId, _timestamp);
  return `${lpadding}${_scrambleId}${scrambledTimestamp}${rpadding}`;
};

export const verify = (ns: string, timestampRange = 60000): boolean => {
  if (ns == null || ns.length < NONCE_LENGTH) {
    logger.error(`invalid parse nonce: ${ns}`);
    return false;
  }
  const _ns = ns.substring(4);
  const type = _ns.charAt(0);
  if (type != "0") {
    logger.error(`invalid parse nonce: ${ns}`);
    return false;
  }

  const scrambleId = parseInt(ns.substring(1, 2));
  const scrambledTimestamp = ns.substring(2);
  const un = unscrambleTimestamp(scrambleId, scrambledTimestamp);
  const timestamp = parseInt(un) + baseline;

  const currentTime = Date.now();
  return Math.abs(currentTime - timestamp) < timestampRange;
};
