import type { Metadata } from "next";

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
        the cookies needed to run the site, so we don&apos;t ask for consent.
        We don&apos;t use analytics or advertising cookies.
      </p>
      <p className="mb-8">
        Links their creator restricted show a bot check first. It&apos;s{" "}
        <a href="https://altcha.org" className="underline">
          ALTCHA
        </a>
        , hosted by us: your browser solves a small puzzle and sends the answer
        back to us. It sets no cookies and nothing goes to third parties.
      </p>

      <h2 className="mb-2 font-RobotoMono text-xl font-semibold uppercase">
        Strictly necessary
      </h2>
      <p className="mb-4 text-gray-400">
        Needed for sign-in and for short links to work, so they don&apos;t
        require consent (Art. 5(3) ePrivacy Directive).
      </p>
      <CookieTable rows={necessary} />
    </main>
  );
}
