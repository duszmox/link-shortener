import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { getUserLinks, isClickTrackingEnabled } from "@/lib/links";
import { shortUrl } from "@/lib/short-url";
import { LinkCard } from "./link-card";

export const metadata: Metadata = {
  title: "My links | cock.hu",
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});
const formatDate = (date: Date) => `${dateFormat.format(date)} UTC`;

export default async function Dashboard() {
  const { userId } = await auth.protect();
  const [links, requestHeaders] = await Promise.all([
    getUserLinks(userId),
    headers(),
  ]);
  const trackingEnabled = isClickTrackingEnabled();

  return (
    <main className="mx-auto max-w-3xl px-8 py-16">
      <h1 className="mb-2 text-3xl font-bold uppercase">My links</h1>
      <p className="mb-8 text-gray-400">
        {links.length === 0 ? (
          <>
            You haven&apos;t shortened anything yet.{" "}
            <Link href="/" className="underline">
              Shorten your first link
            </Link>
            .
          </>
        ) : (
          `${links.length} link${links.length === 1 ? "" : "s"}`
        )}
      </p>
      <ul className="flex flex-col gap-6">
        {links.map((link) => (
          <li key={link.id}>
            <LinkCard
              link={{
                id: link.id,
                slug: link.slug,
                url: link.url,
                shortUrl: shortUrl(requestHeaders, link.slug),
                blocked: link.blocked,
                trackClicks: link.trackClicks !== false,
                clicks: link.clicks ?? 0,
                createdAt: formatDate(link.createdAt),
                lastClickedAt: link.lastClickedAt
                  ? formatDate(link.lastClickedAt)
                  : null,
              }}
              trackingEnabled={trackingEnabled}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
