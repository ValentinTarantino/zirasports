import type { Metadata } from "next";
import { Suspense } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

const logoPath = "/brand/MINIATURA_F1_ALL_BOYS_20261002_003446_0000.png";

export const metadata: Metadata = {
  title: { default: "Zirasports | Noticias deportivas", template: "%s | Zirasports" },
  description: "Noticias, actualidad y contenido deportivo de Zirasports.",
  icons: { icon: logoPath, apple: logoPath },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-black">
        <Suspense fallback={<header className="sticky top-0 z-50 h-[74px] border-b border-pink-300/60 bg-zinc-950" />}><SiteHeader /></Suspense>
        <main className="flex-1 bg-[radial-gradient(circle_at_8%_10%,rgba(236,72,153,0.07),transparent_22%),radial-gradient(circle_at_92%_72%,rgba(161,161,170,0.10),transparent_27%),linear-gradient(180deg,#fbfbfc_0%,#f5f5f6_52%,#fafafa_100%)]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
