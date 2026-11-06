import { SiteContentKind, UserRole } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { auth } from "@/auth";
import { updatePostContent } from "@/app/actions/posts";
import PostInlineText from "@/components/post-inline-text";
import PostParagraphMediaEditor from "@/components/post-paragraph-media-editor";
import { formatInlineText } from "@/lib/inline-format";
import PostMainImageEditor from "@/components/post-main-image-editor";
import PauseOffscreenMedia from "@/components/pause-offscreen-media";
import { FixedMediaEditor, FixedText, SiteEditModeControl } from "@/components/fixed-site-editing";
import { prisma } from "@/lib/prisma";
import { fixedSiteContent, type FixedSiteContentKey } from "@/lib/site-content";

type ArticleParams = { section: string; story: string };
type ArticleDefinition = {
  imageKey: FixedSiteContentKey;
  labelKey: FixedSiteContentKey;
  titleKey: FixedSiteContentKey;
  bodyKey: FixedSiteContentKey;
};

function PublishedPostArticle({ post, image, paragraphs, editMode, isSuperAdmin }: { post: { id: string; title: string; excerpt: string | null; category: { name: string; slug: string }; author: { name: string | null; email: string }; publishedAt: Date | null }; image: string; paragraphs: string[]; editMode: boolean; isSuperAdmin: boolean }) {
  return <main className="min-h-screen bg-white text-black">{isSuperAdmin && <SiteEditModeControl enabled={editMode} />}{editMode && <form action={updatePostContent} className="mx-auto mt-6 max-w-4xl rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 p-5"><input type="hidden" name="id" value={post.id} /><label className="block text-sm font-bold text-sky-950">Editar titulo<input name="title" defaultValue={post.title} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label><label className="mt-4 block text-sm font-bold text-sky-950">Editar resumen<textarea name="excerpt" defaultValue={post.excerpt ?? ""} rows={3} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label><label className="mt-4 block text-sm font-bold text-sky-950">URL de imagen<input name="image" defaultValue={image} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label>{[1, 2, 3, 4, 5].map((index) => <label key={index} className="mt-4 block text-sm font-bold text-sky-950">Editar parrafo {index}<textarea name={`paragraph${index}`} defaultValue={paragraphs[index - 1] ?? ""} rows={3} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label>)}<button className="mt-4 rounded-md bg-sky-900 px-4 py-2 text-sm font-bold text-white">Guardar cambios</button></form>}<div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_300px] sm:px-6 lg:px-8"><article className="rounded-2xl bg-white p-0 text-black"><p className="text-xs font-black uppercase tracking-[0.25em] text-pink-600">{post.category.name}</p><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{post.title}</h1><div className="mt-8 overflow-hidden rounded-xl"><Image src={image} alt={post.title} width={1400} height={800} className="h-auto w-full object-cover" /></div>{post.excerpt && <p className="mt-6 text-xl leading-8 text-zinc-700">{post.excerpt}</p>}{paragraphs.map((paragraph, index) => <p key={index} className="mt-6 text-lg leading-8 text-zinc-800">{paragraph}</p>)}<div className="mt-8 border-t border-zinc-200 pt-5 text-sm text-zinc-500">Por {post.author.name ?? post.author.email}{post.publishedAt ? ` · ${post.publishedAt.toLocaleDateString("es-AR")}` : ""}</div><section className="mt-12 rounded-2xl bg-zinc-950 p-8 text-white"><p className="text-xs font-black uppercase tracking-[0.25em] text-pink-400">Gracias por leer</p><h2 className="mt-4 text-4xl font-black">El deporte recién empieza a contarse.</h2><p className="mt-4 max-w-xl text-lg leading-8 text-zinc-300">Seguimos construyendo un lugar para las historias, las voces y la pasión que hacen grande al deporte.</p><div className="mt-8 grid gap-3"><Link href="#article-top" className="rounded-xl border border-white/40 px-5 py-3 text-center text-sm font-black text-white">Volver al inicio de la nota</Link><Link href={`/${post.category.slug}`} className="rounded-xl bg-pink-600 px-5 py-3 text-center text-sm font-black text-white">Volver a la cobertura</Link></div></section></article><aside className="space-y-6 lg:mt-[158px] lg:sticky lg:top-24"><section className="rounded-2xl border-2 border-pink-600 bg-white p-5"><p className="border-b-2 border-pink-600 pb-3 text-xs font-black uppercase tracking-[0.25em] text-pink-600">Sobre Zirasport</p><p className="mt-4 text-sm leading-6">Un espacio para seguir las noticias, las historias y el análisis que atraviesan al deporte.</p><p className="mt-4 text-sm font-bold leading-6">Información clara, cercana y en crecimiento.</p></section><section className="rounded-2xl border-2 border-pink-600 bg-white p-5"><p className="border-b border-pink-600 pb-3 text-xs font-black uppercase tracking-[0.25em] text-pink-600">Explorá las secciones</p>{[{ href: "/masculino", label: "Fútbol masculino" }, { href: "/femenino", label: "Fútbol femenino" }, { href: "/f1", label: "Fórmula 1" }, { href: "/seleccion", label: "Selección Argentina" }].map((item) => <Link key={item.href} href={item.href} className="block border-b border-black/20 py-3 text-sm font-bold text-black transition hover:bg-pink-50 hover:px-2 hover:text-pink-600">{item.label}</Link>)}</section></aside></div></main>;
}

function PublishedPostArticleTemplate({ post, image, paragraphs, editMode, isSuperAdmin }: { post: { id: string; title: string; excerpt: string | null; category: { name: string; slug: string }; author: { name: string | null; email: string }; publishedAt: Date | null }; image: string; paragraphs: string[]; editMode: boolean; isSuperAdmin: boolean }) {
  return <main className="bg-zinc-50"><div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">{isSuperAdmin && <SiteEditModeControl enabled={editMode} />}<div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-10"><article id="article-top" className="scroll-mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/80"><div className="px-5 py-6 sm:px-10 sm:py-10 lg:px-16"><Link href={`/${post.category.slug}`} className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-800 shadow-sm transition hover:border-pink-600 hover:bg-pink-50 hover:text-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600">Volver a {post.category.name}</Link><header className="mx-auto mt-8 max-w-4xl"><p className="text-xs font-black uppercase tracking-[0.28em] text-sky-600">{post.category.name}</p><h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">{post.title}</h1><div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-500"><span>{post.publishedAt?.toLocaleDateString("es-AR")}</span><span aria-hidden="true">·</span><span>Por {post.author.name ?? post.author.email}</span></div></header><div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl bg-zinc-100 shadow-lg ring-1 ring-black/5"><Image src={image} alt={post.title} width={1400} height={800} className="h-auto max-h-[70vh] w-full object-cover" />{editMode && <form action={updatePostContent} className="border-t border-sky-200 bg-sky-50 p-4"><input type="hidden" name="id" value={post.id} /><label className="block text-sm font-bold text-sky-950">URL de imagen<input name="image" defaultValue={image} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label><button className="mt-3 rounded-md bg-sky-900 px-4 py-2 text-sm font-bold text-white">Guardar imagen</button></form>}</div><div className="mx-auto max-w-3xl space-y-7 px-5 py-10 text-lg leading-8 text-zinc-800 sm:px-0 sm:py-14 sm:text-xl sm:leading-9">{editMode ? <form action={updatePostContent} className="space-y-5"><input type="hidden" name="id" value={post.id} /><label className="block text-sm font-bold text-sky-950">Editar resumen<textarea name="excerpt" defaultValue={post.excerpt ?? ""} rows={4} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label>{[1, 2, 3, 4, 5].map((index) => <label key={index} className="block text-sm font-bold text-sky-950">Editar parrafo {index}<textarea name={`paragraph${index}`} defaultValue={paragraphs[index - 1] ?? ""} rows={4} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label>)}<button className="rounded-md bg-sky-900 px-4 py-2 text-sm font-bold text-white">Guardar texto</button></form> : <>{post.excerpt && <p className="break-words whitespace-pre-line">{post.excerpt}</p>}{paragraphs.map((paragraph, index) => <p key={index} className="break-words whitespace-pre-line">{paragraph}</p>)}</>}</div><section className="relative isolate overflow-visible bg-white px-5 py-12 text-white sm:px-10 lg:px-16"><div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0"><div className="absolute inset-y-3 left-2 right-2 rounded-[2.5rem_1rem_3rem_1.5rem] bg-zinc-950 shadow-[0_0_0_2px_#09090b]" /></div><div className="relative z-10 mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_260px] md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-pink-400">Gracias por leer</p><h2 className="mt-4 max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">El deporte recién empieza a contarse.</h2><p className="mt-5 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">Seguimos construyendo un lugar para las historias, las voces y la pasión que hacen grande al deporte.</p></div><div className="grid gap-3"><Link href="#article-top" className="rounded-xl border border-white/40 px-5 py-3 text-center text-sm font-black text-white">Volver al inicio de la nota</Link><Link href={`/${post.category.slug}`} className="rounded-xl bg-pink-600 px-5 py-3 text-center text-sm font-black text-white">Volver a la cobertura</Link></div></div></section></div></article><aside className="space-y-6 lg:mt-[158px] lg:sticky lg:top-24"><section className="rounded-2xl border-2 border-pink-600 bg-white p-5 text-black shadow-sm"><p className="border-b-2 border-pink-600 pb-3 text-xs font-black uppercase tracking-[0.25em] text-pink-600">Sobre Zirasport</p><p className="mt-4 text-sm leading-6">Un espacio para seguir las noticias, las historias y el análisis que atraviesan al deporte.</p><p className="mt-4 text-sm font-bold leading-6">Información clara, cercana y en crecimiento.</p></section><section className="rounded-2xl border-2 border-pink-600 bg-white p-5 text-black shadow-sm"><p className="border-b border-pink-600 pb-3 text-xs font-black uppercase tracking-[0.25em] text-pink-600">Explorá las secciones</p>{[{ href: "/masculino", label: "Fútbol masculino" }, { href: "/femenino", label: "Fútbol femenino" }, { href: "/f1", label: "Fórmula 1" }, { href: "/seleccion", label: "Selección Argentina" }].map((item) => <Link key={item.href} href={item.href} className="block border-b border-black/20 py-3 text-sm font-bold text-black transition hover:bg-pink-50 hover:px-2 hover:text-pink-600">{item.label}</Link>)}</section><Link href={`/${post.category.slug}`} className="block rounded-2xl border-2 border-pink-600 bg-white p-5 text-center font-black text-pink-600 transition hover:bg-pink-600 hover:text-white">Ver más noticias</Link></aside></div></div></main>;
}

function AdminCreatedPostArticle({ post, image, paragraphs, paragraphTitles, media, metaDate, metaAuthor, imageCaption, editMode, isSuperAdmin }: { post: { id: string; title: string; excerpt: string | null; category: { name: string; slug: string }; author: { name: string | null; email: string }; publishedAt: Date | null }; image: string; paragraphs: string[]; paragraphTitles: string[]; media: { url: string; kind: "IMAGE" | "VIDEO"; caption: string }[]; metaDate: string; metaAuthor: string; imageCaption: string; editMode: boolean; isSuperAdmin: boolean }) {
 return <main className="bg-zinc-50"><div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">{isSuperAdmin && <SiteEditModeControl enabled={editMode} />}<div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-10"><article id="article-top" className="scroll-mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/80"><div className="px-5 py-6 sm:px-10 sm:py-10 lg:px-16"><Link href={`/${post.category.slug}`} className="group inline-flex items-center gap-3 border-l-[3px] border-pink-600 bg-zinc-950 px-4 py-3 transition-colors hover:bg-pink-600"><span className="text-[10px] font-black uppercase tracking-[0.16em] text-pink-300 transition-colors group-hover:text-white">Volver a</span><span className="text-sm font-bold text-white">{post.category.name}</span></Link><header className="mx-auto mt-8 max-w-4xl"><p className="text-xs font-black uppercase tracking-[0.28em] text-sky-600">{post.category.name}</p><PostInlineText id={post.id} name="title" value={post.title} label="título" editMode={editMode} as="h1" className="mt-4 text-4xl font-black leading-[0.95] tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl" /><div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-4 text-sm text-zinc-500"><PostInlineText id={post.id} name="metaDate" value={metaDate} label="fecha" editMode={editMode} className="text-sm text-zinc-500" /><span>·</span><span>Por</span><PostInlineText id={post.id} name="metaAuthor" value={metaAuthor} label="nombre / firma" editMode={editMode} className="text-sm text-zinc-500" /></div></header><div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl bg-zinc-100 shadow-lg ring-1 ring-black/5">{image ? <Image src={image} alt={post.title} width={1400} height={800} className="h-auto max-h-[70vh] w-full object-cover" /> : <div className="grid aspect-[16/9] place-items-center bg-gradient-to-br from-zinc-800 via-zinc-700 to-black text-sm font-semibold text-zinc-300">Imagen principal de la noticia</div>}{(imageCaption || editMode) && <PostInlineText id={post.id} name="imageCaption" value={imageCaption} label="pie de foto" editMode={editMode} className="border-t border-zinc-200 bg-white px-4 py-3 text-sm italic text-zinc-500" />}<PostMainImageEditor postId={post.id} value={image} editMode={editMode} /></div><div className="mx-auto max-w-3xl px-5 py-10 text-zinc-800 sm:px-0 sm:py-14">{(editMode || post.excerpt) && <PostInlineText id={post.id} name="excerpt" value={post.excerpt ?? ""} label="bajada" editMode={editMode} multiline className="mb-8 break-words whitespace-pre-line text-lg leading-8 sm:text-xl sm:leading-9" />}{[1,2,3,4,5].map((n) => (editMode || paragraphTitles[n-1] || paragraphs[n-1] || media[n-1]?.url) && <section key={n} className="mb-9 space-y-4"><PostInlineText id={post.id} name={`paragraphTitle${n}`} value={paragraphTitles[n-1] ?? ""} label={`título del párrafo ${n}`} editMode={editMode} as="h3" enableBold className="break-words text-xl font-black leading-tight text-zinc-950 sm:text-2xl" /><PostInlineText id={post.id} name={`paragraph${n}`} value={paragraphs[n-1] ?? ""} label={`texto del párrafo ${n}`} editMode={editMode} multiline enableBold className="break-words whitespace-pre-line text-lg leading-8 sm:text-xl sm:leading-9" /><PostParagraphMediaEditor postId={post.id} paragraphNumber={n} value={media[n-1]?.url ?? ""} kind={media[n-1]?.kind ?? "IMAGE"} editMode={editMode} />{(editMode || media[n-1]?.caption) && <PostInlineText id={post.id} name={`mediaCaption${n}`} value={media[n-1]?.caption ?? ""} label={`pie de foto o video del párrafo ${n}`} editMode={editMode} className="text-sm italic text-zinc-500" />}</section>)}</div><section className="relative isolate overflow-visible bg-white px-5 py-12 text-white sm:px-10 lg:px-16"><div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0"><div className="absolute inset-y-3 left-2 right-2 rounded-[2.5rem_1rem_3rem_1.5rem] bg-zinc-950 shadow-[0_0_0_2px_#09090b]" /></div><div className="relative z-10 mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_260px] md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-pink-400">Gracias por leer</p><h2 className="mt-4 max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">El deporte recién empieza a contarse.</h2><p className="mt-5 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">Seguimos construyendo un lugar para las historias, las voces y la pasión que hacen grande al deporte.</p></div><div className="grid gap-3"><Link href="#article-top" className="rounded-xl border border-white/40 px-5 py-3 text-center text-sm font-black text-white">Volver al inicio de la nota</Link><Link href={`/${post.category.slug}`} className="rounded-xl bg-pink-600 px-5 py-3 text-center text-sm font-black text-white">Volver a la cobertura</Link></div></div></section></div></article><aside className="space-y-6 lg:mt-[158px] lg:sticky lg:top-24"><section className="rounded-2xl border-2 border-pink-600 bg-white p-5 text-black shadow-sm"><p className="border-b-2 border-pink-600 pb-3 text-xs font-black uppercase tracking-[0.25em] text-pink-600">Sobre Zirasport</p><p className="mt-4 text-sm leading-6">Un espacio para seguir las noticias, las historias y el análisis que atraviesan al deporte.</p><p className="mt-4 text-sm font-bold leading-6">Información clara, cercana y en crecimiento.</p></section><section className="rounded-2xl border-2 border-pink-600 bg-white p-5 text-black shadow-sm"><p className="border-b border-pink-600 pb-3 text-xs font-black uppercase tracking-[0.25em] text-pink-600">Explorá las secciones</p>{[{href:"/masculino",label:"Fútbol masculino"},{href:"/femenino",label:"Fútbol femenino"},{href:"/f1",label:"Fórmula 1"},{href:"/seleccion",label:"Selección Argentina"}].map((x)=><Link key={x.href} href={x.href} className="block border-b border-black/20 py-3 text-sm font-bold text-black transition hover:bg-pink-50 hover:text-pink-600">{x.label}</Link>)}</section><Link href={`/${post.category.slug}`} className="block rounded-2xl border-2 border-pink-600 bg-white p-5 text-center font-black text-pink-600 transition hover:bg-pink-600 hover:text-white">Ver más noticias</Link></aside></div></div></main>;
}

const sectionNames: Record<string, string> = {
  general: "Actualidad general",
  masculino: "Fútbol masculino",
  femenino: "Fútbol femenino",
  f1: "Fórmula 1",
  seleccion: "Selección Argentina",
};

function getDefinition(section: string, story: string): ArticleDefinition | null {
  if (section === "general") {
    const generalStories: Record<string, ArticleDefinition> = {
      hero: { imageKey: "home.hero.image", labelKey: "home.hero.eyebrow", titleKey: "home.hero.title", bodyKey: "home.hero.body" },
      "side-1": { imageKey: "home.side.one.image", labelKey: "home.side.one.label", titleKey: "home.side.one.title", bodyKey: "home.side.one.body" },
      "side-2": { imageKey: "home.side.two.image", labelKey: "home.side.two.label", titleKey: "home.side.two.title", bodyKey: "home.side.two.body" },
    };
    return generalStories[story] ?? null;
  }

  if (!(section in sectionNames) || section === "general" || !["one", "two", "three"].includes(story)) return null;
  const prefix = `section.${section}.${story}` as const;
  return {
    imageKey: `${prefix}.image` as FixedSiteContentKey,
    labelKey: `${prefix}.label` as FixedSiteContentKey,
    titleKey: `${prefix}.title` as FixedSiteContentKey,
    bodyKey: `${prefix}.body` as FixedSiteContentKey,
  };
}

async function ArticlePageContent({ section, story }: ArticleParams) {
  await connection();

  const definition = getDefinition(section, story);
  if (!definition) {
    const decodedStory = decodeURIComponent(story);
    const [postResult, session, settings] = await Promise.all([
      prisma.post.findFirst({ where: { slug: decodedStory, status: "PUBLISHED", category: { slug: section } }, include: { category: true, author: true } }),
      auth(),
      prisma.siteSettings.findUnique({ where: { id: "global" }, select: { editModeEnabled: true } }),
    ]);
    const post = { ...postResult!, publishedAt: postResult?.publishedAt ?? new Date() };
    if (!post) notFound();
    if (!post) return null;
    const image = typeof post.content === "object" && post.content !== null && "image" in post.content && typeof post.content.image === "string" ? post.content.image : "/brand/MINIATURA_F1_ALL_BOYS_20261002_003446_0000.png";
    const editMode = session?.user.role === UserRole.SUPER_ADMIN && settings?.editModeEnabled === true;
    const postData = typeof post.content === "object" && post.content !== null ? post.content as Record<string, unknown> : {};
    const postParagraphs = Array.isArray(postData.paragraphs) ? postData.paragraphs.map((item) => typeof item === "string" ? item : "") : [post.excerpt ?? "Texto de prueba de la noticia."];
    const paragraphTitles = Array.isArray(postData.paragraphTitles) ? postData.paragraphTitles.map((item) => typeof item === "string" ? item : "") : [];
    const rawMedia = Array.isArray(postData.media) ? postData.media : [];
    const postMedia = Array.from({ length: 5 }, (_, index) => {
      const item = rawMedia[index] && typeof rawMedia[index] === "object" ? rawMedia[index] as Record<string, unknown> : {};
      return { url: typeof item.url === "string" ? item.url : "", kind: item.kind === "VIDEO" ? "VIDEO" as const : "IMAGE" as const, caption: typeof item.caption === "string" ? item.caption : "" };
    });
    const metaDate = typeof postData.metaDate === "string" ? postData.metaDate : post.publishedAt?.toLocaleDateString("es-AR") ?? "";
    const metaAuthor = typeof postData.metaAuthor === "string" ? postData.metaAuthor : post.author.name ?? post.author.email;
    const imageCaption = typeof postData.imageCaption === "string" ? postData.imageCaption : "";
    return <AdminCreatedPostArticle post={post} image={image} paragraphs={postParagraphs} paragraphTitles={paragraphTitles} media={postMedia} metaDate={metaDate} metaAuthor={metaAuthor} imageCaption={imageCaption} editMode={editMode} isSuperAdmin={session?.user.role === UserRole.SUPER_ADMIN} />;
    if (editMode) return <main className="min-h-screen bg-white text-black"><SiteEditModeControl enabled /><form action={updatePostContent} className="mx-auto mt-6 max-w-4xl rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 p-5"><input type="hidden" name="id" value={post.id} /><label className="block text-sm font-bold text-sky-950">Editar titulo<input name="title" defaultValue={post.title} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label><label className="mt-4 block text-sm font-bold text-sky-950">Editar resumen<textarea name="excerpt" defaultValue={post.excerpt ?? ""} rows={4} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label><label className="mt-4 block text-sm font-bold text-sky-950">URL de imagen<input name="image" defaultValue={image} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label>{[1, 2, 3, 4, 5].map((index) => <label key={index} className="mt-4 block text-sm font-bold text-sky-950">Editar parrafo {index}<textarea name={`paragraph${index}`} defaultValue={postParagraphs[index - 1] ?? ""} rows={4} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label>)}<button className="mt-4 rounded-md bg-sky-900 px-4 py-2 text-sm font-bold text-white">Guardar cambios</button></form><article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"><p className="text-xs font-black uppercase tracking-[0.25em] text-pink-600">{post.category.name}</p><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{post.title}</h1><div className="mt-8 overflow-hidden rounded-xl"><Image src={image} alt={post.title} width={1400} height={800} className="h-auto w-full object-cover" /></div><p className="mt-6 text-xl leading-8 text-zinc-700">{post.excerpt}</p>{postParagraphs.map((paragraph, index) => <p key={index} className="mt-6 text-lg leading-8 text-zinc-800">{paragraph}</p>)}</article></main>;
    return <main className="min-h-screen bg-white text-black">{editMode && <SiteEditModeControl enabled />}{editMode && <form action={updatePostContent} className="mx-auto mt-6 max-w-4xl rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 p-5"><input type="hidden" name="id" value={post.id} /><label className="block text-sm font-bold text-sky-950">Editar título<input name="title" defaultValue={post.title} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label><label className="mt-4 block text-sm font-bold text-sky-950">Editar resumen<textarea name="excerpt" defaultValue={post.excerpt ?? ""} rows={4} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label><label className="mt-4 block text-sm font-bold text-sky-950">URL de imagen<input name="image" defaultValue={image} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /></label><button className="mt-4 rounded-md bg-sky-900 px-4 py-2 text-sm font-bold text-white">Guardar cambios</button></form>}<article className="mx-auto w-full max-w-4xl px-4 py-12 text-black sm:px-6 lg:px-8"><p className="text-xs font-black uppercase tracking-[0.25em] text-pink-600">{post.category.name}</p><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{post.title}</h1><div className="mt-8 overflow-hidden rounded-xl"><Image src={image} alt={post.title} width={1400} height={800} className="h-auto w-full object-cover" /></div>{post.excerpt && <p className="mt-6 text-xl leading-8 text-zinc-700">{post.excerpt}</p>}<div className="mt-8 border-t border-zinc-200 pt-5 text-sm text-zinc-500">Por {post.author.name ?? post.author.email}{post.publishedAt ? ` · ${post.publishedAt.toLocaleDateString("es-AR")}` : ""}</div></article></main>;
  }

  const [session, settings, savedContent] = await Promise.all([
    auth(),
    prisma.siteSettings.findUnique({ where: { id: "global" } }),
    prisma.siteContent.findMany(),
  ]);
  const savedByKey = new Map(savedContent.map((item) => [item.key, item]));
  const text = (key: FixedSiteContentKey) => savedByKey.get(key)?.value ?? fixedSiteContent[key].value;
  const editMode = session?.user.role === UserRole.SUPER_ADMIN && settings?.editModeEnabled === true;
  const image = text(definition.imageKey);
  const title = text(definition.titleKey);
  const body = text(definition.bodyKey);
  const label = text(definition.labelKey);
  const bodyHeadingKey = `${definition.bodyKey}.heading`;
  const metadataDateKey = `${definition.bodyKey}.meta.date`;
  const metadataAuthorKey = `${definition.bodyKey}.meta.author`;
  const bodyParagraphKeys = [1, 2, 3, 4, 5].map((index) => `${definition.bodyKey}.paragraph.${index}`);
  const bodySubtitleKeys = [1, 2, 3, 4, 5].map((index) => `${definition.bodyKey}.subtitle.${index}`);
  const bodyHeading = savedByKey.get(bodyHeadingKey)?.value ?? "Toda la información y el análisis";
  const metadataDate = savedByKey.get(metadataDateKey)?.value ?? "05/11/2026 · Actualizado recientemente";
  const metadataAuthor = savedByKey.get(metadataAuthorKey)?.value ?? "Por Redacción Zirasport";
  const bodySubtitles = bodySubtitleKeys.map((key) => savedByKey.get(key)?.value ?? "");
  const bodyParagraphs = [
    savedByKey.get(bodyParagraphKeys[0])?.value ?? "En Zirasport seguimos cada detalle, con la información de sus protagonistas y el contexto necesario para entender lo que pasa dentro y fuera de la cancha.",
    savedByKey.get(bodyParagraphKeys[1])?.value ?? "Esta noticia se actualizará con las novedades más importantes de la jornada. Podés volver a la sección para encontrar más historias relacionadas.",
    savedByKey.get(bodyParagraphKeys[2])?.value ?? "",
    savedByKey.get(bodyParagraphKeys[3])?.value ?? "",
    savedByKey.get(bodyParagraphKeys[4])?.value ?? "",
  ];
  const paragraphs = body.split(/\r?\n\s*\r?\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const bodyMedia = [1, 2, 3, 4, 5].map((index) => {
    const key = `${definition.bodyKey}.media.${index}`;
    const item = savedByKey.get(key);
    return { key, value: item?.value ?? "", kind: item?.kind ?? SiteContentKind.IMAGE };
  });
  const imageCaptionKey = `${definition.imageKey}.caption`;
  const imageCaption = savedByKey.get(imageCaptionKey)?.value ?? "";
  const bodyMediaCaptions = bodyMedia.map((media) => savedByKey.get(`${media.key}.caption`)?.value ?? "");
  const relatedStories = section === "general"
    ? [{ href: "/noticia/general/hero", label: "Actualidad general" }, { href: "/noticia/general/side-1", label: "Análisis y noticias" }, { href: "/noticia/general/side-2", label: "Protagonistas" }]
    : ["one", "two", "three"].map((relatedStory) => ({ href: `/noticia/${section}/${relatedStory}`, label: `${sectionNames[section]} · ${relatedStory === "one" ? "Destacada" : relatedStory === "two" ? "Resultados" : "Actualidad"}` }));

  function renderBodyMedia(item: (typeof bodyMedia)[number]) {
    if (!item.value) return null;
    if (item.kind === SiteContentKind.IMAGE) return <Image src={item.value} alt="Multimedia del artículo" width={1200} height={700} className="h-auto max-h-[65vh] w-full rounded-xl object-cover" />;
    const directVideo = /\.(mp4|webm|ogg)(?:$|\?)/i.test(item.value);
    return <PauseOffscreenMedia>{directVideo ? <video src={item.value} title="Video del artículo" className="max-h-[65vh] w-full rounded-xl bg-black" controls playsInline preload="metadata" /> : <iframe src={item.value} title="Video del artículo" loading="lazy" className="aspect-video w-full rounded-xl bg-black" allowFullScreen />}</PauseOffscreenMedia>;
  }

  return <main className="bg-zinc-50">
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      {session?.user.role === UserRole.SUPER_ADMIN && <SiteEditModeControl enabled={editMode} />}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
      <article id="article-top" className="scroll-mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/80">
        <div className="px-5 py-6 sm:px-10 sm:py-10 lg:px-16">
        <Link href={section === "general" ? "/" : `/${section}`} className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-800 shadow-sm transition hover:border-pink-600 hover:bg-pink-50 hover:text-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600">Volver a {section === "general" ? "inicio" : sectionNames[section]}</Link>
        <header className="mx-auto mt-8 max-w-4xl">
          <FixedText contentKey={definition.labelKey} value={label} editMode={editMode} label="etiqueta" className="text-xs font-black uppercase tracking-[0.28em] text-sky-600" />
          <FixedText contentKey={definition.titleKey} value={title} editMode={editMode} label="título" as="h1" className="mt-4 text-4xl font-black leading-[0.95] tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl" />
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-500">
            <FixedText contentKey={metadataDateKey} value={metadataDate} editMode={editMode} label="fecha y actualización" as="span" className="text-sm text-zinc-500" />
            <span aria-hidden="true">·</span>
            <FixedText contentKey={metadataAuthorKey} value={metadataAuthor} editMode={editMode} label="firma" as="span" className="text-sm text-zinc-500" />
          </div>
        </header>

        <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl bg-zinc-100 shadow-lg ring-1 ring-black/5">
          {image ? <Image src={image} alt={title} width={1400} height={800} className="h-auto max-h-[70vh] w-full object-cover" /> : <div className="grid aspect-[16/9] place-items-center bg-gradient-to-br from-zinc-800 via-zinc-700 to-black text-sm font-semibold text-zinc-300">Imagen principal de la noticia</div>}
          {(imageCaption || editMode) && <div className="border-t border-zinc-200 bg-white px-4 py-3 text-sm italic text-zinc-500"><FixedText contentKey={imageCaptionKey} value={imageCaption} editMode={editMode} label="pie de foto" className="text-sm italic text-zinc-500" /></div>}
          {editMode && <FixedMediaEditor contentKey={definition.imageKey} value={image} label="imagen principal" editMode />}
        </div>

        <div className="mx-auto max-w-3xl space-y-7 px-5 py-10 text-lg leading-8 text-zinc-800 sm:px-0 sm:py-14 sm:text-xl sm:leading-9">
          {editMode ? <FixedText contentKey={definition.bodyKey} value={body} editMode label="bajada y párrafos introductorios" multiline enableBold className="break-words whitespace-pre-line text-lg leading-8 text-zinc-800 sm:text-xl sm:leading-9" /> : paragraphs.map((paragraph, index) => <p key={`${paragraph.slice(0, 20)}-${index}`} className="break-words whitespace-pre-line">{formatInlineText(paragraph)}</p>)}
          <FixedText contentKey={bodyHeadingKey} value={bodyHeading} editMode={editMode} label="título del cuerpo" as="h2" className="pt-3 text-2xl font-black leading-tight text-zinc-950 sm:text-3xl" />
          {bodyParagraphs.map((paragraph, index) => (editMode || paragraph || bodySubtitles[index] || bodyMedia[index].value) && <section key={bodyParagraphKeys[index]} className="space-y-3">
            <FixedText contentKey={bodySubtitleKeys[index]} value={bodySubtitles[index]} editMode={editMode} label={`subtítulo del párrafo ${index + 1}`} as="h3" className="break-words whitespace-pre-line text-xl font-black leading-tight text-zinc-950 sm:text-2xl" />
            <FixedText contentKey={bodyParagraphKeys[index]} value={paragraph} editMode={editMode} label={`párrafo ${index + 1}`} multiline enableBold className="break-words whitespace-pre-line text-lg leading-8 text-zinc-800 sm:text-xl sm:leading-9" />
            {editMode && <FixedMediaEditor contentKey={bodyMedia[index].key} value={bodyMedia[index].value} kind={bodyMedia[index].kind === SiteContentKind.VIDEO ? "VIDEO" : "IMAGE"} label={`imagen o video del párrafo ${index + 1}`} editMode allowVideo />}
            {renderBodyMedia(bodyMedia[index]) && <div className="my-8">{renderBodyMedia(bodyMedia[index])}</div>}
            {(bodyMediaCaptions[index] || editMode) && <div className="text-sm italic text-zinc-500"><FixedText contentKey={`${bodyMedia[index].key}.caption`} value={bodyMediaCaptions[index]} editMode={editMode} label="pie de foto o video" className="text-sm italic text-zinc-500" /></div>}
          </section>)}
        </div>
        <section className="relative isolate overflow-visible bg-white px-5 py-12 text-white sm:px-10 lg:px-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute inset-y-3 left-2 right-2 rounded-[2.5rem_1rem_3rem_1.5rem] bg-zinc-950 shadow-[0_0_0_2px_#09090b]" />
          </div>
          <div className="relative z-10 mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_260px] md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-400">Gracias por leer</p>
              <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">El deporte recién empieza a contarse.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">Seguimos construyendo un lugar para las historias, las voces y la pasión que hacen grande al deporte.</p>
            </div>
            <div className="grid gap-3">
              <Link href="#article-top" className="rounded-xl border border-white/40 px-5 py-3 text-center text-sm font-black text-white transition hover:border-white hover:bg-white/10">Volver al inicio de la nota</Link>
              <Link href={section === "general" ? "/" : `/${section}`} className="rounded-xl bg-sky-900 px-5 py-3 text-center text-sm font-black text-sky-50 transition hover:bg-sky-800">Volver a la cobertura</Link>
            </div>
          </div>
        </section>
        </div>
      </article>
      <aside className="space-y-6 rounded-2xl bg-zinc-950 p-4 lg:sticky lg:top-24 lg:mt-[158px]">
        <section className="p-5 text-zinc-100">
          <p className="border-b-2 border-pink-500 pb-3 text-xs font-black uppercase tracking-[0.25em] text-pink-300">Sobre Zirasport</p>
          <p className="mt-4 text-sm leading-6">Un espacio para seguir las noticias, las historias y el análisis que atraviesan al deporte.</p>
          <p className="mt-4 text-sm font-bold leading-6">Información clara, cercana y en crecimiento.</p>
        </section>
        <section className="p-5 text-zinc-100">
          <p className="border-b border-pink-500 pb-3 text-xs font-black uppercase tracking-[0.25em] text-pink-300">Explorá las secciones</p>
          <nav className="mt-2" aria-label="Secciones deportivas">
            {[{ href: "/masculino", label: "Fútbol masculino" }, { href: "/femenino", label: "Fútbol femenino" }, { href: "/f1", label: "Fórmula 1" }, { href: "/seleccion", label: "Selección Argentina" }].map((item) => <Link key={item.href} href={item.href} className="block border-b border-pink-500/45 py-3 text-sm font-bold text-zinc-100 transition-colors hover:bg-transparent hover:text-pink-300">{item.label}</Link>)}
          </nav>
        </section>
        <Link href={section === "general" ? "/" : `/${section}`} className="block rounded-2xl bg-zinc-900 p-5 text-center font-black text-white transition-colors hover:bg-pink-300 hover:text-zinc-950">Ver más noticias</Link>
      </aside>
      </div>
    </div>
  </main>;
}

async function ArticleRoute({ params }: { params: Promise<ArticleParams> }) {
  const { section, story } = await params;
  return <ArticlePageContent section={section} story={story} />;
}

export default function ArticlePage({ params }: { params: Promise<ArticleParams> }) {
  return <Suspense fallback={<main className="min-h-[70vh] bg-white" />}><ArticleRoute params={params} /></Suspense>;
}
