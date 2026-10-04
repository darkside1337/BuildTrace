import type { Metadata } from "next";
import "@fontsource-variable/inter-tight";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuildTrace",
  description: "Local setup for tracing PC parts, builds, and warranty history.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
