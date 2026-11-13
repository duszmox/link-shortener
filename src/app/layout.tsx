import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import Link from "next/link";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { CookieBanner, CookieSettingsButton } from "./cookie-banner";
import "./globals.css";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "Link Shortener | cock.hu",
  description: "The world's best link shortener",
};

function Header() {
  return (
    <header className="flex items-center justify-end gap-4 px-8 pt-4 font-RobotoMono text-sm">
      <Show when="signed-in">
        <Link href="/" className="underline">
          Shorten
        </Link>
        <Link href="/dashboard" className="underline">
          My links
        </Link>
        <UserButton />
      </Show>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="underline">Sign in</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="rounded-md bg-gray-100 px-3 py-1 text-black hover:bg-gray-300">
            Sign up
          </button>
        </SignUpButton>
      </Show>
    </header>
  );
}

function Footer() {
  return (
    <footer className="flex items-center justify-center gap-4 px-8 pb-8 font-RobotoMono text-xs text-gray-400">
      <Link href="/legal/cookies" className="underline">
        Cookie policy
      </Link>
      <CookieSettingsButton />
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" className={robotoMono.variable}>
        <body>
          <Header />
          {children}
          <Footer />
          <CookieBanner />
        </body>
      </html>
    </ClerkProvider>
  );
}
