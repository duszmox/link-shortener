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
  return Response.json(data);
}
