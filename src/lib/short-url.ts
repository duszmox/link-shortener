// Builds the public short url from the incoming request's headers
export function shortUrl(headers: Headers, slug: string) {
  const proto = headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? "https";
  return `${proto}://${headers.get("host")}/${slug}`;
}
