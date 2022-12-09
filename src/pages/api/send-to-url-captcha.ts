/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";
import { withHCaptcha, NextApiRequestWithHCaptcha } from "next-hcaptcha";
import config from "../../../next-hcaptcha.config";

export default withHCaptcha(
  (req: NextApiRequestWithHCaptcha, res: NextApiResponse) => {
    res.status(200).json({ message: "Hello World" });
  }
);
