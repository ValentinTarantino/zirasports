import { UserRole } from "@prisma/client";
import { connection } from "next/server";
import { auth } from "@/auth";
import AdminEditToolsToggle from "@/components/admin-edit-tools-toggle";

export default async function AdminEditToolsFooter() {
  await connection();
  const session = await auth();
  return session?.user.role === UserRole.SUPER_ADMIN ? <AdminEditToolsToggle /> : null;
}
