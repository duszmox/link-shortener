import { createLink, URL_PATTERN } from "@/lib/links";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { url, slug, blocked } = body ?? {};

  if (!url || typeof url !== "string") {
    return Response.json({ message: "Missing url" }, { status: 400 });
  }
  if (!URL_PATTERN.test(url)) {
    return Response.json({ message: "Invalid url" }, { status: 400 });
  }

  try {
    const link = await createLink({
      url,
      slug: typeof slug === "string" && slug !== "" ? slug : null,
      blocked,
    });
    return Response.json({
      message: "Short link created",
      link: "https://" + req.headers.get("host") + "/" + link.slug,
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { message: "Short link not created", error: String(err) },
      { status: 500 }
    );
  }
}
