"use client";

import { useState } from "react";

const URL_PATTERN =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

function ShortenedUrl({ url }: { url: string }) {
  if (url === "") return null;
  return (
    <div className="text-center">
      Here is your shortened url:{" "}
      <a className="font-bold block underline text-blue-400" href={url}>
        {url}
      </a>
      <button
        className="block font-bold text-center w-full p-4"
        onClick={() => navigator.clipboard.writeText(url)}
      >
        Click here to copy to clipboard
      </button>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [long, setLong] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [slug, setSlug] = useState("");
  const [blocked, setBlocked] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const nurl = long.startsWith("http") ? long : `https://${long}`;

    if (!URL_PATTERN.test(nurl)) {
      alert("invalid url");
      setIsLoading(false);
      return;
    }
    if (!/^[A-Za-z1-9-]{1,15}$/.test(slug) && slug !== "") {
      alert("invalid slug");
      setIsLoading(false);
      return;
    }
    const res = await fetch("/api/add-url", {
      method: "POST",
      body: JSON.stringify({
        url: nurl,
        slug: slug === "" ? null : slug,
        blocked,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setIsLoading(false);
    if (!res.ok) {
      alert(data.message);
      return;
    }
    setUrl(data.link);
    setLong("");
  };

  return (
    <div className="px-8">
      <main className="min-h-screen py-16 flex-1 flex flex-col items-center">
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-200 opacity-50 z-10"></div>
        )}
        <h1 className="text-3xl font-bold text-center uppercase mb-16">
          cock.hu <br />{" "}
          <span className="block text-xl p-2">The world&apos;s best link shortener</span>
        </h1>
        <div className="rounded-lg border-gray-600 min-w-[350px] max-w-[600px] w-5/6 border-2 p-8">
          <p className="text-center font-bold p-4">
            Enter the link you want to shorten!
          </p>

          <div className="transition ease-in-out">
            <ShortenedUrl url={url} />
          </div>

          <form method="POST" onSubmit={handleSubmit}>
            <label
              htmlFor="url"
              className="text-gray-400 block pl-2 uppercase pb-1"
            >
              Url <span className="m-0 p-0 inline text-[0.5rem]">(required)</span>
            </label>
            <input
              type="text"
              className="bg-gray-800 rounded-md outline-hidden p-4 w-full font-RobotoMono"
              placeholder="Url..."
              name="url"
              id="url"
              required
              onChange={(e) => setLong(e.target.value)}
              value={long}
            />
            <button
              className="font-bold text-xs text-right w-full underline font-RobotoMono"
              type="button"
              onClick={() => setShowCustomize(!showCustomize)}
            >
              Customize
            </button>
            <div className={showCustomize ? "" : "hidden"}>
              <label
                htmlFor="slug"
                className="text-gray-400 block pl-2 uppercase pb-1"
              >
                Slug
              </label>
              <input
                type="text"
                className="bg-gray-800 rounded-md outline-hidden p-4 w-full font-RobotoMono"
                placeholder="Custom slug..."
                name="slug"
                id="slug"
                onChange={(e) => setSlug(e.target.value)}
                value={slug}
              />
              <div className="mt-4">
                <label
                  htmlFor="youKnowWhat"
                  className="text-gray-400 inline-block pl-2 uppercase pb-1"
                >
                  Restrict from malicious IPs
                </label>
                <input
                  type="checkbox"
                  name="youKnowWhat"
                  id="youKnowWhat"
                  className="rounded-md ml-3 h-4 w-4 align-baseline"
                  onChange={(e) => setBlocked(e.target.checked)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-gray-100 hover:bg-gray-300 transition-all ease-in-out rounded-md text-black outline-hidden p-4 w-full font-RobotoMono mt-4"
            >
              Shorten!
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
