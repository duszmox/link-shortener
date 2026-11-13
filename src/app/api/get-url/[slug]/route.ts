import { getLinkBySlug } from "@/lib/links";

export async function GET(
  _req: Request,
  { params }: RouteContext<"/api/get-url/[slug]">
) {
  const { slug } = await params;
  const data = await getLinkBySlug(slug);
  if (!data) {
    return Response.json(
      { message: "Short link not found" },
      {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "s-maxage=10000000000, stale-while-revalidate",
        },
      }
    );
  }
  // Owner and click stats are private. Restricted links only reveal their
  // destination after the bot check on /captcha, so it's withheld here too.
  const { id, createdAt, blocked } = data;
  const url = blocked ? null : data.url;
  return Response.json({ id, createdAt, url, slug: data.slug, blocked });
}
