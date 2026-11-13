import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";
import { isIpBlocked } from "@/lib/ip-blocklist";
import { getLinkBySlug, recordClick, shouldTrackClicks } from "@/lib/links";
import { slugFromPath } from "@/lib/slug";

const RICKROLL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

const clerk = clerkMiddleware();

function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

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
    const ip = getClientIp(req);
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
  const res = NextResponse.redirect(new URL("/captcha", req.url));
  res.cookies.set("url", data.url);
  return res;
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
