import type { Metadata } from "next";
import { CookieSettingsButton } from "@/app/cookie-banner";

export const metadata: Metadata = {
  title: "Cookie policy | cock.hu",
};

type CookieRow = {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
};

const necessary: CookieRow[] = [
  {
    name: "__session, __client_uat (and suffixed variants)",
    provider: "cock.hu (via Clerk)",
    purpose: "Keeps you signed in to your account.",
    duration: "Until you sign out, up to the session lifetime",
  },
  {
    name: "__client, __refresh",
    provider: "cock.hu authentication domain (via Clerk)",
    purpose: "Identifies your browser to the sign-in service.",
    duration: "Up to 1 year",
  },
  {
    name: "__clerk_db_jwt, __clerk_handshake*, __clerk_redirect*",
    provider: "cock.hu (via Clerk)",
    purpose: "Short-lived sign-in handshake and redirect state.",
    duration: "Seconds to minutes, or the browser session",
  },
  {
    name: "url",
    provider: "cock.hu",
    purpose:
      "Carries the destination of a restricted short link to the check page.",
    duration: "Browser session",
  },
  {
    name: "cookie_consent",
    provider: "cock.hu",
    purpose: "Remembers your cookie choice and when you made it.",
    duration: "6 months",
  },
];

const optional: CookieRow[] = [
  {
    name: "_GRECAPTCHA and Google account cookies",
    provider: "Google LLC (reCAPTCHA)",
    purpose:
      "Bot detection on short links their creator restricted. Google receives your IP address and browser data and processes them under its own privacy policy, including transfers to the USA under the EU-US Data Privacy Framework.",
    duration: "Up to 6 months",
  },
];

function CookieTable({ rows }: { rows: CookieRow[] }) {
  return (
    <div className="mb-8 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b-2 border-gray-600 font-RobotoMono uppercase text-gray-400">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Provider</th>
            <th className="py-2 pr-4">Purpose</th>
            <th className="py-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-gray-700 align-top">
              <td className="py-2 pr-4 font-RobotoMono">{row.name}</td>
              <td className="py-2 pr-4">{row.provider}</td>
              <td className="py-2 pr-4">{row.purpose}</td>
              <td className="py-2">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiePolicy() {
  return (
    <main className="mx-auto max-w-3xl px-8 py-16">
      <h1 className="mb-8 text-3xl font-bold uppercase">Cookie policy</h1>

      <p className="mb-4">
        Cookies are small files a website stores in your browser. We only use
        the cookies needed to run the site, unless you agree to more. We
        don&apos;t use analytics or advertising cookies.
      </p>
      <p className="mb-8">
        You can change or withdraw your consent at any time, as easily as you
        gave it: <CookieSettingsButton />. Withdrawing consent doesn&apos;t
        affect anything done before. Cookies Google has already set stay on
        google.com until they expire or you delete them in your browser.
      </p>

      <h2 className="mb-2 font-RobotoMono text-xl font-semibold uppercase">
        Strictly necessary
      </h2>
      <p className="mb-4 text-gray-400">
        Needed for sign-in and for short links to work, so they don&apos;t
        require consent (Art. 5(3) ePrivacy Directive).
      </p>
      <CookieTable rows={necessary} />

      <h2 className="mb-2 font-RobotoMono text-xl font-semibold uppercase">
        Optional, only with your consent
      </h2>
      <p className="mb-4 text-gray-400">
        Loaded only after you accept them. If you don&apos;t, restricted links
        still open, just without the Google check.
      </p>
      <CookieTable rows={optional} />
    </main>
  );
}
