import { prisma } from "@/db/client";

export const URL_PATTERN =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

// 4 character slug of lowercase letters and digits
const randomSlug = () => Math.random().toString(36).substring(2, 6);

export function getLinkBySlug(slug: string) {
  return prisma.shortLink.findUnique({ where: { slug } });
}

export async function createLink({
  url,
  slug,
  blocked,
}: {
  url: string;
  slug?: string | null;
  blocked?: boolean;
}) {
  let finalSlug = slug ?? randomSlug();
  // if the slug is taken, fall back to a random one that is free
  while (await getLinkBySlug(finalSlug)) {
    finalSlug = randomSlug();
  }
  return prisma.shortLink.create({
    data: { slug: finalSlug, url, blocked: Boolean(blocked) },
  });
}
