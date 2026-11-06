import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const adminRoles: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR];

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !adminRoles.includes(session.user.role)) {
    redirect("/login?callbackUrl=/admin");
  }
  return session.user;
}

export async function requireSuperAdmin() {
  const user = await requireAdmin();
  if (user.role !== UserRole.SUPER_ADMIN) redirect("/admin");
  return user;
}

