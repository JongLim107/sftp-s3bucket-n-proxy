import { logger, StatusCode } from "@sftp-s3bucket-n-proxy/shared";
import { get } from "radash";

export const validateRequest = (req, res, next): boolean => {
  const { originalUrl, headers } = req;
  const route = originalUrl.split("/").pop();
  const headerKeys = Object.keys(headers);

  let configKeys = [];
  let matchKeys = [];
  try {
    const configs = JSON.parse(process.env.SOURCE_SYSTEM_CONFIG || "");
    const routeName = Object.keys(configs).some((k) => k === route) ? route : `/${route}`;
    const routeCfg = get(configs, routeName, {});

    configKeys = Object.keys(routeCfg);
    matchKeys = headerKeys.filter((key) => {
      const envValue = routeCfg[key];
      const headerValue = headers[key];
      return envValue === headerValue;
    });
  } catch (error) {
    logger.error("System environment missing configuration: SOURCE_SYSTEM_CONFIG", error);
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }

  if (matchKeys.length !== configKeys.length) {
    return res.status(StatusCode.UNAUTHORISED).json({
      errors: {
        message: "API key or secret is missing/invalid",
        fields: configKeys.filter((key) => !matchKeys.includes(key)),
      },
    });
  }
  next();
};
