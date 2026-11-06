import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import DeletePostButton from "@/components/delete-post-button";
import { requireAdmin } from "@/lib/require-admin";

async function deletePost(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
}

async function publishPost(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.post.update({ where: { id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
  revalidatePath("/admin/posts");
  for (const path of ["/masculino", "/femenino", "/f1", "/seleccion"]) revalidatePath(path);
}

async function PostsContent() {
  await requireAdmin();
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" }, include: { category: true, author: true } });
  return <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white p-5 text-black"><div className="flex items-center justify-between"><h2 className="text-lg font-black text-black">Noticias</h2><Link href="/admin/posts/new" className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white">+ Nueva</Link></div><table className="mt-4 w-full min-w-[860px] text-left text-sm text-black"><thead className="border-b border-zinc-400 text-zinc-700"><tr><th className="py-3">Titulo</th><th>Categoria</th><th>Estado</th><th>Autor</th><th className="text-right">Acciones</th></tr></thead><tbody className="divide-y divide-zinc-200">{posts.map((post) => <tr key={post.id}><td className="py-4 font-bold text-black">{post.title}<p className="text-xs font-normal text-zinc-500">/{post.slug}</p></td><td className="text-black">{post.category.name}</td><td className="text-black">{post.status}</td><td className="text-black">{post.author.name ?? post.author.email}</td><td className="text-right"><div className="flex justify-end gap-2">{post.status !== "PUBLISHED" && <form action={publishPost}><input type="hidden" name="id" value={post.id} /><button className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700">Publicar</button></form>}<DeletePostButton id={post.id} title={post.title} action={deletePost} /></div></td></tr>)}</tbody></table>{posts.length === 0 && <p className="py-8 text-sm text-zinc-500">Todavia no hay noticias.</p>}</div>;
}

export default function PostsPage() { return <section className="mx-auto w-full max-w-7xl px-4 py-10 text-black sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">Contenido</p><h1 className="mt-2 text-3xl font-black text-black">Noticias</h1><div className="mt-8"><Suspense fallback={<p>Cargando noticias...</p>}><PostsContent /></Suspense></div></section>; }
