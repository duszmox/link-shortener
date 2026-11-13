"use client";

import { useEffect, useRef, useState } from "react";
import type {} from "altcha/types/react";
import type { Challenge } from "altcha-lib";
import { unlockLink } from "./actions";

type VerifiedEvent = CustomEvent<{ payload: string }>;

export function LinkCheck({
  slug,
  challenge,
}: {
  slug: string;
  challenge: Challenge;
}) {
  const widgetRef = useRef<HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    const onVerified = async (event: Event) => {
      const { payload } = (event as VerifiedEvent).detail;
      try {
        const result = await unlockLink(slug, payload);
        if ("url" in result) {
          // replace: the back button shouldn't land on the check again
          window.location.replace(result.url);
        } else {
          setError(result.error);
        }
      } catch {
        setError("Couldn't reach the server. Please try again.");
      }
    };
    const onExpired = () =>
      setError("The check expired. Please reload the page.");

    widget.addEventListener("verified", onVerified);
    widget.addEventListener("expired", onExpired);
    // The web component touches browser APIs, so it's only loaded on the client.
    // Listeners go on first so the "verified" event can't be missed.
    import("altcha");
    return () => {
      widget.removeEventListener("verified", onVerified);
      widget.removeEventListener("expired", onExpired);
    };
  }, [slug]);

  return (
    <div className="flex flex-col items-center gap-4">
      <altcha-widget
        ref={widgetRef}
        challenge={JSON.stringify(challenge)}
        auto="onload"
        suppressHydrationWarning
      />
      {error && (
        <div role="alert" className="flex flex-col items-center gap-2">
          <p className="text-sm text-red-500">{error}</p>
          <button
            type="button"
            className="rounded-md border-2 border-gray-600 px-4 py-2 font-RobotoMono text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            // A fresh page load issues a fresh challenge
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
