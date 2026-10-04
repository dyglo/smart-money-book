"use client";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const admin = path.startsWith("/admin") || path === "/login";
  return (
    <>
      {!admin && <Header />}
      {children}
      {!admin && <Footer />}
    </>
  );
}
