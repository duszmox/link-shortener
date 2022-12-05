/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // https://www.cloudflare.com/cdn-cgi/trace
  fetch("https://www.cloudflare.com/cdn-cgi/trace")
    .then((res) => res.text())
    .then((text) => {
        const ip = text.split("ip=")[1].split("\n")[0]
        res.status(200).json({ ip });
    });
};
