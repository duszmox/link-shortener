import { auth } from "@clerk/nextjs/server";
import { createLink, SlugTakenError } from "@/lib/links";
import { shortUrl } from "@/lib/short-url";
import { getSlugError, URL_PATTERN } from "@/lib/slug";
import { getUrlBlockMessage } from "@/lib/url-safety";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { url, slug, blocked } = body ?? {};

  if (!url || typeof url !== "string") {
    return Response.json({ message: "Missing url" }, { status: 400 });
  }
  if (!URL_PATTERN.test(url)) {
    return Response.json({ message: "Invalid url" }, { status: 400 });
  }
  const customSlug = typeof slug === "string" && slug !== "" ? slug : null;
  const slugError = customSlug && getSlugError(customSlug);
  if (slugError) {
    return Response.json({ message: slugError }, { status: 400 });
  }

  const blockMessage = await getUrlBlockMessage(url);
  if (blockMessage) {
    return Response.json({ message: blockMessage }, { status: 403 });
  }

  // Signed-in users own their links; anonymous links still work
  const { userId } = await auth();

  try {
    const link = await createLink({ url, slug: customSlug, blocked, userId });
    return Response.json({
      message: "Short link created",
      link: shortUrl(req.headers, link.slug),
    });
  } catch (err) {
    if (err instanceof SlugTakenError) {
      return Response.json({ message: err.message }, { status: 409 });
    }
    console.error(err);
    return Response.json(
      { message: "Short link not created", error: String(err) },
      { status: 500 }
    );
  }
}
