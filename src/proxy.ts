import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";
import { getClientIp, isIpBlocked, RICKROLL } from "@/lib/ip-blocklist";
import { getLinkBySlug, recordClick, shouldTrackClicks } from "@/lib/links";
import { slugFromPath } from "@/lib/slug";

const clerk = clerkMiddleware();

async function resolveShortLink(
  req: NextRequest,
  event: NextFetchEvent,
  slug: string
) {
  let data;
  try {
    data = await getLinkBySlug(slug);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(RICKROLL);
  }
  if (!data) return null;

  if (data.blocked) {
    const ip = getClientIp(req.headers);
    if (ip && isIpBlocked(ip)) {
      return NextResponse.redirect(RICKROLL);
    }
  }

  if (shouldTrackClicks(data)) {
    // Count the click after the redirect is sent so it doesn't slow it down
    event.waitUntil(recordClick(data.id).catch(console.error));
  }

  if (!data.blocked) {
    return NextResponse.redirect(new URL(data.url));
  }
  // The destination stays on the server until the browser passes the check
  const check = new URL("/captcha", req.url);
  check.searchParams.set("slug", data.slug);
  return NextResponse.redirect(check);
}

export async function proxy(req: NextRequest, event: NextFetchEvent) {
  // Short links skip Clerk so redirects stay fast and never hit an auth handshake
  const slug = slugFromPath(req.nextUrl.pathname);
  if (slug) {
    const res = await resolveShortLink(req, event, slug);
    if (res) return res;
  }
  return clerk(req, event);
}

export const config = {
  matcher: [
    // Everything except Next internals and static files (Clerk's recommended matcher)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
