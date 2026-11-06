import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import AdminSignOut from "@/components/admin-sign-out";

const modules = [
  { href: "/admin", label: "Resumen", icon: "⌂" },
  { href: "/admin/posts", label: "Noticias", icon: "▤" },
  { href: "/admin/media", label: "Multimedia", icon: "▶" },
  { href: "/admin/categories", label: "Categorías", icon: "#" },
  { href: "/admin/users", label: "Usuarios y roles", icon: "◉" },
];

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-8 text-zinc-600">Cargando panel...</p>}>
      <AdminContent />
    </Suspense>
  );
}

async function AdminContent() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-zinc-200 bg-white p-4 lg:min-h-[calc(100vh-10rem)] lg:w-64 lg:border-b-0 lg:border-r lg:p-6">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Administración</p>
            <p className="mt-2 truncate font-bold text-black">{session.user.email}</p>
          </div>
          <nav aria-label="Navegación del panel" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {modules.map((module, index) => (
              <Link
                key={module.href}
                href={module.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${index === 0 ? "bg-black text-white" : "text-zinc-700 hover:bg-zinc-100"}`}
              >
                <span aria-hidden="true" className="w-5 text-center text-base">{module.icon}</span>
                {module.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 border-t border-zinc-200 pt-4">
            <Link href="/" className="block px-3 py-2 text-sm font-semibold text-zinc-600 hover:text-black">← Ver sitio público</Link>
            <AdminSignOut />
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">Panel de control</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">Bienvenido, {session.user.name ?? "administrador"}</h1>
              <p className="mt-2 text-zinc-600">Rol actual: {session.user.role}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-bold text-black hover:bg-zinc-50">Editar contenido del sitio</Link>
              <Link href="/admin/posts/new" className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-bold text-white hover:bg-zinc-800">+ Nueva noticia</Link>
            </div>
          </div>

          <section aria-label="Resumen del contenido" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Noticias publicadas", "0", "Contenido visible en el sitio"],
              ["Borradores", "0", "Pendientes de edición"],
              ["Videos y media", "0", "Archivos disponibles"],
              ["Usuarios activos", "1", "Administradores y editores"],
            ].map(([label, value, detail]) => (
              <article key={label} className="rounded-xl border border-zinc-200 bg-white p-5">
                <p className="text-sm font-semibold text-zinc-500">{label}</p>
                <p className="mt-3 text-3xl font-black text-black">{value}</p>
                <p className="mt-1 text-xs text-zinc-500">{detail}</p>
              </article>
            ))}
          </section>

          <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-xl font-black text-black">Próximas acciones</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Link href="/admin/posts/new" className="rounded-lg border border-zinc-200 p-4 hover:border-black">
                <p className="font-bold text-black">Crear noticia</p>
                <p className="mt-1 text-sm text-zinc-500">Publicá el primer contenido de Zirasport.</p>
              </Link>
              <Link href="/admin/categories" className="rounded-lg border border-zinc-200 p-4 hover:border-black">
                <p className="font-bold text-black">Configurar categorías</p>
                <p className="mt-1 text-sm text-zinc-500">Organizá las secciones deportivas.</p>
              </Link>
              <Link href="/admin/users" className="rounded-lg border border-zinc-200 p-4 hover:border-black">
                <p className="font-bold text-black">Invitar colaboradores</p>
                <p className="mt-1 text-sm text-zinc-500">Sumá editores y administradores.</p>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
