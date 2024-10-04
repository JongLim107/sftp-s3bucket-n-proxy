import { tryit } from "radash";
import { Request, Response, Router } from "express";
import { HttpClient, createNonce } from "@sftp-s3bucket-n-proxy/shared";
import { validateRequest } from "../validator/source-system-validator";

const dynamicRouter = Router();
const getSrcConfig = tryit(() => JSON.parse(process.env.SOURCE_SYSTEM_CONFIG));

Promise.resolve(getSrcConfig()).then(([error, srcConfigs]) => {
  if (!error && srcConfigs) {
    Object.keys(srcConfigs).forEach((key) => {
      const routeName = ("/" + key).replace("//", "/");
      dynamicRouter.post(routeName, validateRequest, async (req: Request, res: Response) => {
        try {
          const destConfigs = JSON.parse(process.env.INTERNAL_FORWARD_CONFIG);
          const secretConfigs = destConfigs[routeName];
          const resp = await HttpClient().post(process.env.FORWARD_PROXY_BASE_ROUTE + routeName, req.body, {
            headers: {
              "content-type": "*/*",
              "x-sgwp-nonce": createNonce(),
              ...secretConfigs,
            },
          });
          res.status(resp.status).send(resp.data);
        } catch (error) {
          res.status(error.status).send(error.message);
        }
      });
    });
  }
});

export default dynamicRouter;
