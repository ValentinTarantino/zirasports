import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-admin";

async function inviteUser(formData: FormData) {
  "use server";
  const inviter = await requireSuperAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? UserRole.EDITOR) as UserRole;
  if (!email || (role !== UserRole.ADMIN && role !== UserRole.EDITOR)) return;
  const token = randomBytes(32).toString("hex");
  await prisma.adminInvitation.create({ data: { email, role, tokenHash: createHash("sha256").update(token).digest("hex"), invitedById: inviter.id, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 72) } });
  revalidatePath("/admin/users");
}

async function updateRole(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? UserRole.USER) as UserRole;
  if (!id || !Object.values(UserRole).includes(role)) return;
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
}

async function UsersContent() {
  await requireSuperAdmin();
  const [users, invitations] = await Promise.all([prisma.user.findMany({ orderBy: { createdAt: "desc" } }), prisma.adminInvitation.findMany({ orderBy: { createdAt: "desc" }, take: 10 })]);
  return <div className="space-y-6"><form action={inviteUser} className="rounded-xl border border-zinc-200 bg-white p-5"><h2 className="text-lg font-black">Invitar colaborador</h2><div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]"><input name="email" type="email" required placeholder="colaborador@email.com" className="rounded-lg border border-zinc-300 px-3 py-2" /><select name="role" defaultValue={UserRole.EDITOR} className="rounded-lg border border-zinc-300 px-3 py-2"><option value={UserRole.EDITOR}>Editor</option><option value={UserRole.ADMIN}>Administrador</option></select><button className="rounded-lg bg-black px-4 py-2 font-bold text-white">Crear invitación</button></div></form><div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white p-5"><h2 className="text-lg font-black">Usuarios registrados</h2><table className="mt-4 w-full min-w-[620px] text-left text-sm"><thead className="border-b text-zinc-500"><tr><th className="py-3">Usuario</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead><tbody className="divide-y">{users.map((user) => <tr key={user.id}><td className="py-3"><p className="font-bold">{user.name ?? "Sin nombre"}</p><p className="text-zinc-500">{user.email}</p></td><td>{user.role}</td><td>{user.isActive ? "Activo" : "Inactivo"}</td><td><form action={updateRole} className="flex gap-2"><input type="hidden" name="id" value={user.id} /><select name="role" defaultValue={user.role} className="rounded border px-2 py-1"><option value={UserRole.USER}>USER</option><option value={UserRole.EDITOR}>EDITOR</option><option value={UserRole.ADMIN}>ADMIN</option><option value={UserRole.SUPER_ADMIN}>SUPER_ADMIN</option></select><button className="rounded bg-zinc-900 px-2 py-1 text-white">Guardar</button></form></td></tr>)}</tbody></table></div><div className="rounded-xl border border-zinc-200 bg-white p-5"><h2 className="text-lg font-black">Invitaciones recientes</h2><div className="mt-3 space-y-2 text-sm">{invitations.map((invitation) => <p key={invitation.id} className="flex justify-between border-b py-2"><span>{invitation.email} · {invitation.role}</span><span className="text-zinc-500">{invitation.acceptedAt ? "Aceptada" : "Pendiente"}</span></p>)}{invitations.length === 0 && <p className="text-zinc-500">No hay invitaciones.</p>}</div></div></div>;
}

export default function UsersPage() { return <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">Seguridad</p><h1 className="mt-2 text-3xl font-black">Usuarios y roles</h1><p className="mt-2 text-zinc-600">Solo un SUPER_ADMIN puede invitar usuarios o modificar roles.</p><div className="mt-8"><Suspense fallback={<p>Cargando usuarios...</p>}><UsersContent /></Suspense></div></section>; }
