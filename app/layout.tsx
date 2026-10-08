import type { ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = localFont({ src: "./fonts/dm-sans.woff2", weight: "400 700", display: "swap", variable: "--font-interface" });
const newsreader = localFont({ src: "./fonts/newsreader.woff2", weight: "400 500", display: "swap", variable: "--font-editorial" });
const plexMono = localFont({ src: "./fonts/ibm-plex-mono.woff2", weight: "400", display: "swap", variable: "--font-identifier", preload: false });

export const metadata: Metadata = {
  title: "BuildTrace",
  description: "A PC parts workspace for independent shops. Start with a clear catalog of models, identifiers, and tracking rules.",
  icons: {
    icon: [{ url: "/brand/buildtrace-trace-app-icon.png", type: "image/png", sizes: "1254x1254" }],
    apple: [{ url: "/brand/buildtrace-trace-app-icon.png", type: "image/png", sizes: "1254x1254" }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${newsreader.variable} ${plexMono.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
