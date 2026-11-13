import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createLinkChallenge } from "@/lib/altcha";
import { getLinkBySlug } from "@/lib/links";
import { SLUG_PATTERN } from "@/lib/slug";
import { LinkCheck } from "./link-check";

export const metadata: Metadata = {
  title: "Checking your browser | cock.hu",
  robots: { index: false, follow: false },
};

export default async function CaptchaPage({
  searchParams,
}: PageProps<"/captcha">) {
  const { slug } = await searchParams;
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) notFound();

  const link = await getLinkBySlug(slug);
  if (!link) notFound();
  // Unrestricted links need no check (e.g. the owner turned it off since)
  if (!link.blocked) redirect(link.url);

  const challenge = await createLinkChallenge(slug);

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-6 px-8 py-24 text-center">
      <h1 className="text-2xl font-bold uppercase">Checking your browser</h1>
      <p className="text-gray-400">
        The creator of this link asked for a quick bot check. Your browser
        solves a small puzzle on its own, then you&apos;re sent on your way.
        No cookies, nothing sent to third parties.
      </p>
      <LinkCheck slug={slug} challenge={challenge} />
    </main>
  );
}
