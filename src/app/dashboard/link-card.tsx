"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteLink, saveLink, setLinkOption } from "./actions";

export type DashboardLink = {
  id: string;
  slug: string;
  url: string;
  shortUrl: string;
  blocked: boolean;
  trackClicks: boolean;
  clicks: number;
  createdAt: string;
  lastClickedAt: string | null;
};

const inputClass =
  "bg-gray-800 rounded-md outline-hidden p-3 w-full font-RobotoMono";
const labelClass = "text-gray-400 block pl-2 uppercase pb-1 text-xs";

export function LinkCard({
  link,
  trackingEnabled,
}: {
  link: DashboardLink;
  trackingEnabled: boolean;
}) {
  const [slug, setSlug] = useState(link.slug);
  const [url, setUrl] = useState(link.url);
  const [state, formAction, saving] = useActionState(saveLink, null);
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const dirty = slug !== link.slug || url !== link.url;

  const run = (action: () => Promise<void>) => {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch {
        setError("Something went wrong, try again");
      }
    });
  };

  return (
    <div
      className={`rounded-lg border-2 border-gray-600 p-6 ${busy ? "opacity-60" : ""}`}
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <a
          href={link.shortUrl}
          className="font-bold break-all text-blue-400 underline"
          target="_blank"
          rel="noreferrer"
        >
          {link.shortUrl}
        </a>
        <button
          type="button"
          className="text-xs font-bold underline"
          onClick={() => navigator.clipboard.writeText(link.shortUrl)}
        >
          Copy
        </button>
      </div>

      <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-gray-400 uppercase">Created</dt>
          <dd>{link.createdAt}</dd>
        </div>
        {trackingEnabled && (
          <>
            <div>
              <dt className="text-xs text-gray-400 uppercase">Clicks</dt>
              <dd>{link.trackClicks ? link.clicks : `${link.clicks} (paused)`}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase">Last click</dt>
              <dd>{link.lastClickedAt ?? "Never"}</dd>
            </div>
          </>
        )}
      </dl>

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={link.id} />
        <div>
          <label htmlFor={`slug-${link.id}`} className={labelClass}>
            Slug
          </label>
          <input
            id={`slug-${link.id}`}
            name="slug"
            className={inputClass}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor={`url-${link.id}`} className={labelClass}>
            Destination
          </label>
          <input
            id={`url-${link.id}`}
            name="url"
            className={inputClass}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={!dirty || saving}
            className="rounded-md bg-gray-100 px-4 py-2 text-black transition-all hover:bg-gray-300 disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {dirty && !saving && (
            <button
              type="button"
              className="text-xs underline"
              onClick={() => {
                setSlug(link.slug);
                setUrl(link.url);
              }}
            >
              Reset
            </button>
          )}
          {state && !saving && (
            <span className={state.ok ? "text-green-400" : "text-red-400"}>
              {state.message}
            </span>
          )}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-700 pt-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={link.blocked}
            disabled={busy}
            onChange={(e) => {
              const value = e.target.checked;
              run(() => setLinkOption(link.id, "blocked", value));
            }}
          />
          Restrict from malicious IPs
        </label>
        {trackingEnabled && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={link.trackClicks}
              disabled={busy}
              onChange={(e) => {
                const value = e.target.checked;
                run(() => setLinkOption(link.id, "trackClicks", value));
              }}
            />
            Count clicks
          </label>
        )}
        <button
          type="button"
          disabled={busy}
          className="ml-auto text-red-400 underline"
          onClick={() => {
            if (confirm(`Delete ${link.shortUrl}? It will stop working.`)) {
              run(() => deleteLink(link.id));
            }
          }}
        >
          Delete
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
