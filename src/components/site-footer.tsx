import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import AdminEditToolsFooter from "@/components/admin-edit-tools-footer";

const logoPath = "/brand/MINIATURA_F1_ALL_BOYS_20261002_003446_0000.png";

const sections = [
  { href: "/masculino", label: "Masculino" },
  { href: "/femenino", label: "Femenino" },
  { href: "/f1", label: "Fórmula 1" },
  { href: "/seleccion", label: "Selección Argentina" },
] as const;

const networks = [
  { label: "Instagram", account: "@zirasports_oficial", href: "https://www.instagram.com/ZIRASPORTS_OFICIAL/?hl=en", icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></> },
  { label: "YouTube", account: "@zirasports", href: "https://www.youtube.com/@zirasports", icon: <><path d="M21.5 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.5.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.7.5 7.5.5 7.5.5s5.8 0 7.5-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.5-4.8Z" /><path d="m10 15.5 5-3.5-5-3.5v7Z" /></> },
  { label: "TikTok", account: "@zirasportsflorestablanca", href: "https://www.tiktok.com/@zirasportsflorestablanca", icon: <path d="M14 3v11.2a4.2 4.2 0 1 1-3.6-4.1M14 3c.5 3.1 2.3 4.9 5.5 5.2" /> },
] as const;

export default function SiteFooter() {
  return <footer className="relative isolate overflow-hidden bg-[#08080a] text-white">
    <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
      <div className="relative grid gap-10 py-12 sm:py-14 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16 lg:py-16">
        <div className="relative flex items-center gap-5">
          <Link href="/" aria-label="Volver al inicio de Zirasports" className="group relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-full border border-white/25 bg-zinc-900 shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition group-hover:border-pink-300">
            <Image src={logoPath} alt="Logo de Zirasports" fill sizes="76px" quality={100} className="object-cover" />
          </Link>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-pink-300">Noticias · análisis · deporte</p>
            <Link href="/" className="mt-2 block text-[clamp(2rem,4vw,3.35rem)] font-black leading-[0.9] tracking-[-0.07em] text-white"><span>ZIRA</span><span className="text-black [-webkit-text-stroke:1px_white]">SPORTS</span></Link>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500">Periodismo deportivo</p>
          </div>
        </div>

        <div className="self-center lg:border-l lg:border-white/10 lg:pl-12">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-[10px] font-black uppercase tracking-[0.26em] text-zinc-400">Zirasports en redes</h2>
          </div>
          <nav aria-label="Redes sociales" className="grid gap-x-7 sm:grid-cols-3">
            {networks.map((network) => <a key={network.label} href={network.href} target="_blank" rel="noreferrer noopener" className="group flex min-w-0 items-center gap-3 border-y border-white/10 py-4 transition-colors hover:border-pink-400/70 sm:border-b-0 sm:border-t-0 sm:py-2">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 shrink-0 fill-none stroke-zinc-400 stroke-[1.7] stroke-linecap-round stroke-linejoin-round transition-colors group-hover:stroke-pink-300">{network.icon}</svg>
              <span className="min-w-0"><span className="block text-sm font-bold text-zinc-100">{network.label}</span><span className="mt-0.5 block truncate text-xs text-zinc-500 transition-colors group-hover:text-pink-200">{network.account}</span></span>
              <span aria-hidden="true" className="ml-auto text-xs text-zinc-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pink-300">↗</span>
            </a>)}
          </nav>
        </div>

      </div>

      <div className="flex flex-col gap-5 border-y border-white/10 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">Secciones</div>
        <nav aria-label="Secciones del sitio" className="flex flex-wrap gap-x-7 gap-y-3">
          {sections.map((section) => <Link key={section.href} href={section.href} className="text-sm font-semibold text-zinc-400 transition-colors hover:text-white">{section.label}</Link>)}
        </nav>
      </div>

      <div className="flex flex-col gap-2 py-4 text-[11px] text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <p>© Zirasports</p>
        <p>Periodismo deportivo</p>
      </div>
      <Suspense fallback={null}><AdminEditToolsFooter /></Suspense>
    </div>
  </footer>;
}
