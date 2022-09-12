/* eslint-disable import/no-anonymous-default-export */

import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../db/client";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //make it post
  if (req.method !== "POST") {
    return res.status(404).json({ message: "Not found" });
  }
  //get the url string and slug string from the body
  const { url } = req.body;
  let { slug } = req.body;
  //generate 4 charachter slug with numbers an upper and lowercase letters
  slug =  slug == null ? Math.random().toString(36).substring(2, 6) : slug;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ message: "Missing url" });
  }
  //if url not https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)

  if (
    !url.match(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    )
  ) {
    return res.status(400).json({ message: "Invalid url" });
  }
  //if the slug is already in the database, return an error
  let existingSlug = await prisma.shortLink.findUnique({
    where: {
      slug,
    },
  });
  if (existingSlug) {
    while (existingSlug) {
      slug = Math.random().toString(36).substring(2, 6);
      existingSlug = await prisma.shortLink.findUnique({
        where: {
          slug,
        },
      });
    }
  }

  //current head url

  // upload the url to the database
  const data = await prisma.shortLink
    .create({
      data: {
        slug: slug,
        url: url,
      },
    })
    .then(() => {
      return res.status(200).json({ message: "Short link created", link: "https://" +req.headers.host + "/" + slug });
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Short link not created", error: err });
    });
};
