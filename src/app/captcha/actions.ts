"use server";

import { headers } from "next/headers";
import { verifyLinkSolution } from "@/lib/altcha";
import { getClientIp, isIpBlocked, RICKROLL } from "@/lib/ip-blocklist";
import { getLinkBySlug } from "@/lib/links";

export type UnlockResult = { url: string } | { error: string };

// A plain POST endpoint like every server action, so it trusts nothing from
// the page: the destination is only returned for a valid, unexpired solution
export async function unlockLink(
  slug: unknown,
  payload: unknown
): Promise<UnlockResult> {
  if (typeof slug !== "string" || typeof payload !== "string") {
    return { error: "Invalid request" };
  }
  if (!(await verifyLinkSolution(payload, slug))) {
    return { error: "The check failed or expired. Please try again." };
  }

  // The proxy checks this too, but this action can be called directly
  const ip = getClientIp(await headers());
  if (ip && isIpBlocked(ip)) return { url: RICKROLL };

  const link = await getLinkBySlug(slug);
  if (!link) return { error: "This short link doesn't exist anymore" };
  return { url: link.url };
}
