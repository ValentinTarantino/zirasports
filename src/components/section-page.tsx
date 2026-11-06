import { UserRole } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import { auth } from "@/auth";
import { SiteEditModeControl, StoryCard } from "@/components/fixed-site-editing";
import { prisma } from "@/lib/prisma";
import { fixedSiteContent, type FixedSiteContentKey } from "@/lib/site-content";

const sectionStories = {
  masculino: ["section.masculino.one", "section.masculino.two", "section.masculino.three"],
  femenino: ["section.femenino.one", "section.femenino.two", "section.femenino.three"],
  f1: ["section.f1.one", "section.f1.two", "section.f1.three"],
  seleccion: ["section.seleccion.one", "section.seleccion.two", "section.seleccion.three"],
} as const;

export type SiteSectionSlug = "masculino" | "femenino" | "f1" | "seleccion";

async function SectionContent({ slug }: { slug: SiteSectionSlug }) {
  await connection();

  const [session, settings, savedContent, publishedPosts] = await Promise.all([
    auth(),
    prisma.siteSettings.findUnique({ where: { id: "global" } }),
    prisma.siteContent.findMany(),
    prisma.post.findMany({ where: { status: "PUBLISHED", category: { slug } }, orderBy: { publishedAt: "desc" }, include: { category: true } }),
  ]);
  const savedByKey = new Map(savedContent.map((item) => [item.key, item.value]));
  const text = (key: FixedSiteContentKey) => savedByKey.get(key) ?? fixedSiteContent[key].value;
  const isSuperAdmin = session?.user.role === UserRole.SUPER_ADMIN;
  const editMode = isSuperAdmin && settings?.editModeEnabled === true;

  return <section className="bg-transparent">
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {isSuperAdmin && <SiteEditModeControl enabled={editMode} />}
      <div className="grid gap-5 md:grid-cols-2">
        {sectionStories[slug].map((prefix, index) => {
          const story = prefix.split(".").pop() ?? "one";
          const imageKey = `${prefix}.image` as FixedSiteContentKey;
          const labelKey = `${prefix}.label` as FixedSiteContentKey;
          const titleKey = `${prefix}.title` as FixedSiteContentKey;
          const bodyKey = `${prefix}.body` as FixedSiteContentKey;
          return <StoryCard key={prefix} imageKey={imageKey} image={text(imageKey)} labelKey={labelKey} label={text(labelKey)} titleKey={titleKey} title={text(titleKey)} bodyKey={bodyKey} body={text(bodyKey)} editMode={editMode} size={index === 0 ? "hero" : "side"} wide={index === 0} href={`/noticia/${slug}/${story}`} />;
        })}
          {publishedPosts.map((post) => { const image = typeof post.content === "object" && post.content !== null && "image" in post.content && typeof post.content.image === "string" ? post.content.image : "/brand/MINIATURA_F1_ALL_BOYS_20261002_003446_0000.png"; return <Link key={post.id} href={`/noticia/${slug}/${post.slug}`} className="group relative block aspect-[16/9] overflow-hidden rounded-xl bg-zinc-900 text-white transition hover:-translate-y-1 hover:shadow-lg"><Image src={image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-5"><p className="text-xs font-black uppercase tracking-widest text-pink-300">{post.category.name}</p><h2 className="mt-2 text-xl font-black leading-tight text-white sm:text-2xl">{post.title}</h2>{post.excerpt && <p className="mt-3 text-sm leading-5 text-zinc-200">{post.excerpt}</p>}</div></Link>; })}
      </div>
    </div>
  </section>;
}

export function SectionPage({ slug }: { slug: SiteSectionSlug }) {
  return <SectionContent slug={slug} />;
}
