import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (
    req.nextUrl.pathname.startsWith("/api/") ||
    req.nextUrl.pathname.startsWith("/_next/") ||
    req.nextUrl.pathname == "/"
  ) {
    console.log("returning early");
    return;
  }

  const slug = req.nextUrl.pathname.split("/").pop();
  const data = await (
    await fetch(`${req.nextUrl.origin}/api/get-url/${slug}`)
  ).json();
  // get the users ip
  if (data.blocked) {
    const isBlocked = await fetch(`${req.nextUrl.origin}/api/is-blocked`, {
      method: "POST",
      body: req.nextUrl.origin
    }).then((res) => {
      return res.json();
    });
    if (isBlocked) {
      return NextResponse.redirect(new URL("https://www.youtube.com/watch?v=dQw4w9WgXcQ"));
    }
  }

  if (data?.url) {
    if (data?.blocked) {
      // set the cookie to url
      const cookie = `url=${data.url}`;
      return NextResponse.redirect(`${req.nextUrl.origin}/captcha`, {
        headers: {
          "Set-Cookie": cookie,
        },
      });
      
    }
    else {
      return NextResponse.redirect(new URL(data.url).href);
    }
    // return NextResponse.redirect(data.url);
  }
}
