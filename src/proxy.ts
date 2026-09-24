import { NextRequest, NextResponse } from "next/server";
import { isIpBlocked } from "@/lib/ip-blocklist";
import { getLinkBySlug } from "@/lib/links";

const RICKROLL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

export async function proxy(req: NextRequest) {
  const slug = req.nextUrl.pathname.split("/").pop();
  if (!slug) return;

  let data;
  try {
    data = await getLinkBySlug(slug);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(RICKROLL);
  }
  if (!data) return;

  if (!data.blocked) {
    return NextResponse.redirect(new URL(data.url));
  }

  const ip = getClientIp(req);
  if (ip && isIpBlocked(ip)) {
    return NextResponse.redirect(RICKROLL);
  }

  const res = NextResponse.redirect(new URL("/captcha", req.url));
  res.cookies.set("url", data.url);
  return res;
}

export const config = {
  // Everything except the home page, API routes, Next internals and static files
  matcher: ["/((?!api/|_next/|captcha$|favicon\\.ico$).+)"],
};
