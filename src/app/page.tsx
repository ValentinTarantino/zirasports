import { UserRole } from "@prisma/client";
import { Suspense } from "react";
import { connection } from "next/server";
import { auth } from "@/auth";
import { SiteEditModeControl, StoryCard } from "@/components/fixed-site-editing";
import SectionLoading from "@/components/section-loading";
import { prisma } from "@/lib/prisma";
import { fixedSiteContent, type FixedSiteContentKey } from "@/lib/site-content";

async function HomeContent() {
  // NextAuth creates request-scoped crypto values while reading the session.
  // Tell Cache Components to render this subtree only once a real request exists.
  await connection();

  const [session, settings, savedContent] = await Promise.all([
    auth(),
    prisma.siteSettings.findUnique({ where: { id: "global" } }),
    prisma.siteContent.findMany(),
  ]);
  const savedByKey = new Map(savedContent.map((item) => [item.key, item.value]));
  const text = (key: FixedSiteContentKey) => savedByKey.get(key) ?? fixedSiteContent[key].value;
  const isSuperAdmin = session?.user.role === UserRole.SUPER_ADMIN;
  const editMode = isSuperAdmin && settings?.editModeEnabled === true;

  const sideStories = [
    { imageKey: "home.side.one.image", labelKey: "home.side.one.label", titleKey: "home.side.one.title", bodyKey: "home.side.one.body" },
    { imageKey: "home.side.two.image", labelKey: "home.side.two.label", titleKey: "home.side.two.title", bodyKey: "home.side.two.body" },
  ] as const;
  const bottomStories = [
    { id: "masculino", imageKey: "section.masculino.one.image", labelKey: "section.masculino.one.label", titleKey: "section.masculino.one.title" },
    { id: "femenino", imageKey: "section.femenino.one.image", labelKey: "section.femenino.one.label", titleKey: "section.femenino.one.title" },
    { id: "f1", imageKey: "section.f1.one.image", labelKey: "section.f1.one.label", titleKey: "section.f1.one.title" },
    { id: "seleccion", imageKey: "section.seleccion.one.image", labelKey: "section.seleccion.one.label", titleKey: "section.seleccion.one.title" },
  ] as const;
  const generalStories = [
    { href: "/noticia/masculino/one", imageKey: "home.general.one.image", labelKey: "home.general.one.label", titleKey: "home.general.one.title", bodyKey: "home.general.one.body" },
    { href: "/noticia/femenino/one", imageKey: "home.general.two.image", labelKey: "home.general.two.label", titleKey: "home.general.two.title", bodyKey: "home.general.two.body" },
    { href: "/noticia/seleccion/one", imageKey: "home.general.three.image", labelKey: "home.general.three.label", titleKey: "home.general.three.title", bodyKey: "home.general.three.body" },
  ] as const;

  return <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
    {isSuperAdmin && <SiteEditModeControl enabled={editMode} />}

    <section aria-labelledby="featured-title" className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.8fr)]">
      <h2 id="featured-title" className="sr-only">Noticias destacadas</h2>
      <StoryCard href="/noticia/general/hero" imageKey="home.hero.image" image={text("home.hero.image")} labelKey="home.hero.eyebrow" label={text("home.hero.eyebrow")} titleKey="home.hero.title" title={text("home.hero.title")} bodyKey="home.hero.body" body={text("home.hero.body")} editMode={editMode} size="hero" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
        {sideStories.map((story, index) => <StoryCard key={story.imageKey} href={`/noticia/general/side-${index + 1}`} imageKey={story.imageKey} image={text(story.imageKey)} labelKey={story.labelKey} label={text(story.labelKey)} titleKey={story.titleKey} title={text(story.titleKey)} bodyKey={story.bodyKey} body={text(story.bodyKey)} editMode={editMode} size="side" />)}
      </div>
    </section>

    <section aria-labelledby="main-sections-title" className="mt-14 border-t border-zinc-200 pt-8">
      <div className="mb-5"><p className="text-xs font-black uppercase tracking-[0.25em] text-pink-600">Cobertura diaria</p><h2 id="main-sections-title" className="mt-1 text-2xl font-black text-black sm:text-3xl">Secciones principales</h2></div>
      <div className="grid gap-5 md:grid-cols-2">
        {bottomStories.slice(0, 2).map((story) => <StoryCard key={story.imageKey} href={`/noticia/${story.id}/one`} sectionId={story.id} imageKey={story.imageKey} image={text(story.imageKey)} labelKey={story.labelKey} label={text(story.labelKey)} titleKey={story.titleKey} title={text(story.titleKey)} editMode={editMode} size="side" />)}
      </div>
    </section>

    <section aria-labelledby="other-sections-title" className="mt-12 border-t border-zinc-200 pt-8">
      <div className="mb-5"><p className="text-xs font-black uppercase tracking-[0.25em] text-pink-600">Más deportes</p><h2 id="other-sections-title" className="mt-1 text-2xl font-black text-black sm:text-3xl">F1 y Selección</h2></div>
      <div className="grid gap-5 md:grid-cols-2">
        {bottomStories.slice(2).map((story) => <StoryCard key={story.imageKey} href={`/noticia/${story.id}/one`} sectionId={story.id} imageKey={story.imageKey} image={text(story.imageKey)} labelKey={story.labelKey} label={text(story.labelKey)} titleKey={story.titleKey} title={text(story.titleKey)} editMode={editMode} size="side" />)}
      </div>
    </section>

    <section aria-labelledby="general-title" className="mt-14 border-t border-zinc-200 pt-8 sm:mt-16 sm:pt-10">
      <div className="mb-6"><p className="text-xs font-black uppercase tracking-[0.25em] text-pink-600">Zirasport</p><h2 id="general-title" className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">Actualidad general</h2></div>
      <div className="grid gap-5 md:grid-cols-3">
        {generalStories.map((story) => <StoryCard key={story.imageKey} href={story.href} imageKey={story.imageKey} image={text(story.imageKey)} labelKey={story.labelKey} label={text(story.labelKey)} titleKey={story.titleKey} title={text(story.titleKey)} bodyKey={story.bodyKey} body={text(story.bodyKey)} editMode={editMode} size="side" />)}
      </div>
    </section>
  </div>;
}

export default function Home() {
  return <Suspense fallback={<SectionLoading />}><HomeContent /></Suspense>;
}
