import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import httpContext from "express-http-context";
import { createBffSignature, getHttpContext } from "../request";
import logger from "../logger";

const requestInterceptor = (request) => {
  if (!process.env.LOG_LEVEL) {
    logger.info(`API request ${request.method} ${request.url}`);
  }
  if (process.env.LOG_LEVEL === "debug") {
    logger.debug(`API request Header ${JSON.stringify(request.headers)}`);
  }
  return request;
};

const responseInterceptor = (response: AxiosResponse) => {
  if (process.env.LOG_LEVEL) {
    logger.info(`API response ${response.config.method} ${response.config.url}, Status: ${response.status}`);
  }
  return response;
};

const errorInterceptor = (error: AxiosError): Promise<AxiosError> => {
  const errResponse = {
    message: error.message || error.response?.data || "Unknown error",
    status: error.status || error.response?.status,
  };
  logger.error(`API error ${error.config.method} ${error.config.url}, ${JSON.stringify(errResponse)}`);
  return Promise.reject({
    ...error,
    ...errResponse,
    status: errResponse.status || 500,
  });
};

const getHttpCfg = (timeout: number) => {
  const rid = httpContext.get("rid") || getHttpContext().get("rid");
  return {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "bff-signature": createBffSignature(rid),
      rid,
    },
    // To avoid Axios to throw Error, so that we can handle all error responses
    validateStatus: () => true,
    timeout,
  };
};

export const HttpClient = (timeout = 10000, performRetries = false): AxiosInstance => {
  const instance = axios.create(getHttpCfg(timeout));

  if (performRetries) {
    // Retry 3 times on requests that return a response (500, etc) before giving up.
    // and retries 2 times on errors that don't return a response (ENOTFOUND, ETIMEDOUT, etc)
    // instance.defaults.raxConfig = { instance };
    // retryAxios.attach(instance);
  }

  const { interceptors } = instance;
  interceptors.request.use(requestInterceptor, errorInterceptor);
  interceptors.response.use(responseInterceptor, errorInterceptor);
  return instance;
};
