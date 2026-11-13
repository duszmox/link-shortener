"use server";

import { auth } from "@clerk/nextjs/server";
import { refresh } from "next/cache";
import {
  deleteUserLink,
  getUserLink,
  SlugTakenError,
  updateUserLink,
} from "@/lib/links";
import { getSlugError, normalizeUrl, URL_PATTERN } from "@/lib/slug";
import { getUrlBlockMessage } from "@/lib/url-safety";

export type SaveLinkState = { ok: boolean; message: string } | null;

const OBJECT_ID = /^[a-f\d]{24}$/i;

// Server actions are plain POST endpoints, so each one checks the session
// and only touches links owned by the signed-in user
async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("You need to be signed in");
  return userId;
}

export async function saveLink(
  _prev: SaveLinkState,
  formData: FormData
): Promise<SaveLinkState> {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();
  const url = normalizeUrl(String(formData.get("url") ?? ""));

  const link = OBJECT_ID.test(id) ? await getUserLink(userId, id) : null;
  if (!link) return { ok: false, message: "Link not found" };

  if (slug !== link.slug) {
    const slugError = getSlugError(slug);
    if (slugError) return { ok: false, message: slugError };
  }
  if (url !== link.url) {
    if (!URL_PATTERN.test(url)) return { ok: false, message: "Invalid url" };
    const blockMessage = await getUrlBlockMessage(url);
    if (blockMessage) return { ok: false, message: blockMessage };
  }

  try {
    await updateUserLink(userId, id, { slug, url });
  } catch (err) {
    if (err instanceof SlugTakenError) return { ok: false, message: err.message };
    throw err;
  }
  refresh();
  return { ok: true, message: "Saved" };
}

export async function setLinkOption(
  id: string,
  option: "blocked" | "trackClicks",
  value: boolean
) {
  const userId = await requireUserId();
  if (!OBJECT_ID.test(id)) throw new Error("Link not found");
  if (option !== "blocked" && option !== "trackClicks") {
    throw new Error("Unknown option");
  }
  await updateUserLink(userId, id, { [option]: Boolean(value) });
  refresh();
}

export async function deleteLink(id: string) {
  const userId = await requireUserId();
  if (!OBJECT_ID.test(id)) throw new Error("Link not found");
  await deleteUserLink(userId, id);
  refresh();
}
