import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

async function createCategory(formData: FormData) {
  "use server";
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!name || !slug) return;
  await prisma.category.create({ data: { name, slug } });
  revalidatePath("/admin/categories");
}

async function CategoriesContent() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true } } } });
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form action={createCategory} className="h-fit rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-black">Nueva categoría</h2>
        <input name="name" required placeholder="Nombre" className="mt-4 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        <input name="slug" required placeholder="slug-ejemplo" className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        <button className="mt-4 w-full rounded-lg bg-black px-4 py-2 font-bold text-white">Crear categoría</button>
      </form>
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-black">Categorías existentes</h2>
        <div className="mt-4 divide-y divide-zinc-100">
          {categories.map((category) => <div key={category.id} className="flex items-center justify-between py-4"><div><p className="font-bold">{category.name}</p><p className="text-sm text-zinc-500">/{category.slug}</p></div><span className="text-sm text-zinc-500">{category._count.posts} noticias</span></div>)}
          {categories.length === 0 && <p className="py-6 text-sm text-zinc-500">Todavía no hay categorías.</p>}
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">Contenido</p><h1 className="mt-2 text-3xl font-black">Categorías</h1><div className="mt-8"><Suspense fallback={<p>Cargando categorías...</p>}><CategoriesContent /></Suspense></div></section>;
}
