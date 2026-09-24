import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={robotoMono.variable}>
      <body>{children}</body>
    </html>
  );
}
