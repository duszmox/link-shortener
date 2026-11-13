import { Prisma } from "@prisma/client";
import { prisma } from "@/db/client";
import { isReservedSlug } from "./slug";

export class SlugTakenError extends Error {
  constructor(slug: string) {
    super(`The slug "${slug}" is already taken`);
  }
}

// 4 character slug of lowercase letters and digits
const randomSlug = () => Math.random().toString(36).substring(2, 6);

const isUniqueViolation = (err: unknown) =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";

export function getLinkBySlug(slug: string) {
  return prisma.shortLink.findUnique({ where: { slug } });
}

export function getUserLinks(userId: string) {
  return prisma.shortLink.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export function getUserLink(userId: string, id: string) {
  return prisma.shortLink.findFirst({ where: { id, userId } });
}

async function insertLink(data: Prisma.ShortLinkCreateInput) {
  if (await getLinkBySlug(data.slug)) throw new SlugTakenError(data.slug);
  try {
    return await prisma.shortLink.create({ data });
  } catch (err) {
    // two requests raced for the same slug
    if (isUniqueViolation(err)) throw new SlugTakenError(data.slug);
    throw err;
  }
}

export async function createLink({
  url,
  slug,
  blocked,
  userId,
}: {
  url: string;
  slug?: string | null;
  blocked?: boolean;
  userId?: string | null;
}) {
  const data = { url, blocked: Boolean(blocked), userId: userId ?? null };
  if (slug) return insertLink({ ...data, slug });

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = randomSlug();
    if (candidate.length < 4 || isReservedSlug(candidate)) continue;
    try {
      return await insertLink({ ...data, slug: candidate });
    } catch (err) {
      if (!(err instanceof SlugTakenError)) throw err;
    }
  }
  throw new Error("Couldn't find a free slug");
}

// Returns null if the link doesn't exist or belongs to someone else
export async function updateUserLink(
  userId: string,
  id: string,
  changes: {
    slug?: string;
    url?: string;
    blocked?: boolean;
    trackClicks?: boolean;
  }
) {
  const link = await getUserLink(userId, id);
  if (!link) return null;

  if (changes.slug !== undefined && changes.slug !== link.slug) {
    if (await getLinkBySlug(changes.slug)) {
      throw new SlugTakenError(changes.slug);
    }
  }
  try {
    return await prisma.shortLink.update({ where: { id }, data: changes });
  } catch (err) {
    if (isUniqueViolation(err) && changes.slug) {
      throw new SlugTakenError(changes.slug);
    }
    throw err;
  }
}

export async function deleteUserLink(userId: string, id: string) {
  const { count } = await prisma.shortLink.deleteMany({ where: { id, userId } });
  return count > 0;
}

// Set DISABLE_CLICK_TRACKING=true to stop counting clicks for every link
export const isClickTrackingEnabled = () =>
  process.env.DISABLE_CLICK_TRACKING !== "true";

// Only owned links are counted: nobody can see the stats of anonymous ones
export const shouldTrackClicks = (link: {
  userId: string | null;
  trackClicks: boolean | null;
}) => isClickTrackingEnabled() && link.userId !== null && link.trackClicks !== false;

export async function recordClick(id: string) {
  // Raw $inc, because older links have no clicks field and Prisma's
  // increment can't start from a missing value
  await prisma.$runCommandRaw({
    update: "ShortLink",
    updates: [
      {
        q: { _id: { $oid: id } },
        u: { $inc: { clicks: 1 }, $currentDate: { lastClickedAt: true } },
      },
    ],
  });
}
