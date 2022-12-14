/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../db/client";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const slug = req.query["slug"] as string;

  if (!slug || typeof slug !== "string") {
    return res.status(404).json({ message: "Missing slug" });
  }
  const data = await prisma.shortLink.findFirst({
    where: {
      slug: {
        equals: slug,
      },
    },
  });
  if (!data) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Cache-Control",
      "s-maxage=10000000000, stale-while-revalidate"
    );
    return res.status(404).json({ message: "Short link not found" });
  }
  return res.json(data);
};
