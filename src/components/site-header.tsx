"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const logoPath = "/brand/MINIATURA_F1_ALL_BOYS_20261002_003446_0000.png";
const navigation = [
  { href: "/masculino", label: "Masculino" },
  { href: "/femenino", label: "Femenino" },
  { href: "/f1", label: "Fórmula 1" },
  { href: "/seleccion", label: "Selección Argentina" },
] as const;

function MenuIcon({ open }: { open: boolean }) {
  return <span aria-hidden="true" className="relative block h-6 w-6">
    <span className={`absolute left-0 h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-in-out motion-reduce:transition-none ${open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-1"}`} />
    <span className={`absolute left-0 top-1/2 h-0.5 w-6 -translate-y-1/2 rounded-full bg-current transition-all duration-300 ease-in-out motion-reduce:transition-none ${open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"}`} />
    <span className={`absolute left-0 h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-in-out motion-reduce:transition-none ${open ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-5"}`} />
  </span>;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return <header className="sticky top-0 z-50 text-white">
    <div className={`relative overflow-hidden border-b transition-all duration-300 ${scrolled ? "border-pink-400/65 bg-zinc-950/95 shadow-[0_14px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl" : "border-pink-300/60 bg-zinc-950 shadow-[0_12px_34px_rgba(0,0,0,0.36)]"}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-0 hidden w-36 lg:block">
          <div className="absolute -inset-y-1/2 -left-7 w-8 -skew-x-[35deg] bg-white/90" />
          <div className="absolute -inset-y-1/2 left-4 w-14 -skew-x-[35deg] bg-zinc-200/85" />
          <div className="absolute -inset-y-1/2 left-11 w-7 -skew-x-[35deg] bg-white/95" />
          <div className="absolute -inset-y-1/2 left-14 w-20 -skew-x-[35deg] bg-zinc-950/75" />
          <div className="absolute -inset-y-1/2 left-24 w-11 -skew-x-[35deg] bg-zinc-300/80" />
        </div>
        <div className="absolute -left-16 top-0 hidden h-full w-52 -skew-x-[32deg] bg-gradient-to-r from-pink-300/35 via-pink-100/15 to-transparent lg:block" />
        <div className="absolute -right-24 top-0 hidden h-full w-80 -skew-x-[32deg] bg-gradient-to-l from-pink-300/30 via-pink-100/15 to-transparent lg:block" />
        <div className="absolute inset-y-0 right-0 hidden w-36 lg:block">
          <div className="absolute -inset-y-1/2 -right-7 w-8 -skew-x-[35deg] bg-white/90" />
          <div className="absolute -inset-y-1/2 right-4 w-14 -skew-x-[35deg] bg-zinc-200/85" />
          <div className="absolute -inset-y-1/2 right-11 w-7 -skew-x-[35deg] bg-white/95" />
          <div className="absolute -inset-y-1/2 right-14 w-20 -skew-x-[35deg] bg-zinc-950/75" />
          <div className="absolute -inset-y-1/2 right-24 w-11 -skew-x-[35deg] bg-zinc-300/80" />
        </div>
        <div className="absolute inset-0 hidden bg-[radial-gradient(ellipse_22rem_10rem_at_left_center,rgba(236,72,153,0.12),transparent_75%),radial-gradient(ellipse_22rem_10rem_at_right_center,rgba(236,72,153,0.12),transparent_75%),radial-gradient(circle_at_85%_0%,rgba(255,255,255,0.1),transparent_28%),linear-gradient(112deg,transparent_0%,transparent_38%,rgba(255,255,255,0.035)_38%,rgba(255,255,255,0.035)_43%,transparent_43%)] lg:block" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center gap-4 transition-all duration-300 ${scrolled ? "min-h-[74px]" : "min-h-[104px]"}`}>
          <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-3 sm:gap-4" aria-label="Zirasports, inicio">
            <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-900 ring-1 ring-white/35 transition-all duration-300 group-hover:ring-pink-300 ${scrolled ? "h-12 w-12" : "h-14 w-14 sm:h-16 sm:w-16"}`}>
              <Image src={logoPath} alt="Logo de Zirasports" width={128} height={128} priority quality={100} className="h-full w-full rounded-full object-cover transition duration-300 group-hover:scale-105" />
            </span>
            <span className="min-w-0">
              <span className={`block whitespace-nowrap font-black leading-none tracking-[-0.06em] ${scrolled ? "text-2xl sm:text-3xl" : "text-[27px] sm:text-4xl"}`}><span>ZIRA</span><span className="text-black [-webkit-text-stroke:1px_white]">SPORTS</span></span>
              <span className="mt-1.5 block whitespace-nowrap text-[8px] font-black uppercase tracking-[0.3em] text-zinc-300 sm:text-[9px]">Periodismo deportivo</span>
            </span>
          </Link>

          <nav aria-label="Navegación principal" className="ml-auto hidden items-center gap-2 xl:gap-4 lg:flex">
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`inline-flex border px-3 py-3 text-base font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink-300 xl:px-4 xl:text-lg ${active ? "border-2 border-white bg-white text-black shadow-[0_0_12px_rgba(236,236,236,0.28)]" : "border-white/80 bg-zinc-950 text-zinc-100 hover:bg-white hover:text-black"}`}>
                {item.label}
              </Link>;
            })}
          </nav>

          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"} aria-expanded={menuOpen} className="ml-auto grid h-10 w-10 shrink-0 place-items-center text-white transition hover:text-pink-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-300 lg:hidden">
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      <div aria-hidden={!menuOpen} inert={!menuOpen} className={`relative overflow-hidden bg-zinc-950/98 shadow-2xl transition-[max-height,opacity,transform] duration-300 ease-in-out motion-reduce:transition-none lg:absolute lg:left-0 lg:right-0 lg:top-full ${menuOpen ? "max-h-80 translate-y-0 border-t border-white/15 opacity-100" : "max-h-0 -translate-y-2 border-t border-transparent opacity-0"}`}>
        <div className="px-4 py-5 lg:px-0">
          <nav aria-label="Menú de secciones" className="mx-auto grid w-full max-w-7xl gap-1 sm:grid-cols-2 lg:max-w-sm lg:grid-cols-1 lg:px-8">
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return <Link key={item.href} href={item.href} onClick={closeMenu} aria-current={active ? "page" : undefined} className={`block border px-3 py-3 text-base font-bold transition-colors hover:bg-white hover:text-black ${active ? "border-2 border-white bg-white text-black shadow-[0_0_12px_rgba(236,236,236,0.28)]" : "border-white/80 bg-zinc-950 text-zinc-100"}`}>{item.label}</Link>;
            })}
          </nav>
        </div>
      </div>
    </div>
    <div aria-hidden="true" className="h-0.5 bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
  </header>;
}
