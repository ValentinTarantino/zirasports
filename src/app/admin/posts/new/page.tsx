import { redirect } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

async function createPost(formData: FormData) {
  "use server";
  const user = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const excerpt = String(formData.get("excerpt") ?? "").trim() || "Esta es una noticia de prueba de Zirasport. Podés editar este texto antes de publicarla.";
  if (!title || !slug || !categoryId) return;
  await prisma.post.create({ data: { title, slug, excerpt, categoryId, authorId: user.id, content: { type: "doc", image: "/brand/MINIATURA_F1_ALL_BOYS_20261002_003446_0000.png", content: [{ type: "paragraph", content: [{ type: "text", text: excerpt }] }] } } });
  redirect("/admin/posts");
}

async function NewPostContent() {
  await requireAdmin();
  const defaultCategories = [
    { name: "Futbol masculino", slug: "masculino" },
    { name: "Futbol femenino", slug: "femenino" },
    { name: "Formula 1", slug: "f1" },
    { name: "Seleccion Argentina", slug: "seleccion" },
  ];
  await Promise.all(defaultCategories.map((category) => prisma.category.upsert({ where: { slug: category.slug }, update: { isActive: true }, create: category })));
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  return <section className="mx-auto w-full max-w-3xl px-4 py-10 text-black sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">Contenido</p><h1 className="mt-2 text-3xl font-black text-black">Nueva noticia</h1><form action={createPost} className="mt-8 space-y-5 rounded-xl border border-zinc-200 bg-white p-6 text-black"><label className="block text-sm font-bold text-black">Titulo<input name="title" required className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-black" /></label><label className="block text-sm font-bold text-black">Slug<input name="slug" required placeholder="titulo-de-la-noticia" className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-black" /></label><label className="block text-sm font-bold text-black">Categoria<select name="categoryId" required className="mt-2 block w-full appearance-auto rounded-lg border border-zinc-300 bg-white px-3 py-2 text-black"><option value="">Seleccionar...</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="block text-sm font-bold text-black">Resumen<textarea name="excerpt" rows={4} className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-black" /></label><button className="rounded-lg bg-black px-5 py-3 font-bold text-white">Guardar borrador</button></form></section>;
}

export default function NewPostPage() {
  return <Suspense fallback={<p className="p-8 text-zinc-600">Cargando editor...</p>}><NewPostContent /></Suspense>;
}
