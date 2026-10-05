import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
const urbanist = localFont({
  src: "./fonts/Urbanist-Variable.ttf",
  variable: "--font-urbanist",
  display: "swap",
  weight: "100 900",
});
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";
import { WorkspaceProvider } from "@/components/workspace-provider";
import { VisitorTracker } from "@/components/visitor-tracker";
import { Analytics } from "@vercel/analytics/next";
export const metadata: Metadata = {
  title: { default: "Smart Money Book", template: "%s | Smart Money Book" },
  description:
    "ICT trading tutorials, strategy guides, PDF books, and educational resources.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={urbanist.variable}>
      <body>
        <WorkspaceProvider>
          <SiteChrome>{children}</SiteChrome>
          <Suspense fallback={null}><VisitorTracker /></Suspense>
        </WorkspaceProvider>
        <Analytics />
      </body>
    </html>
  );
}
