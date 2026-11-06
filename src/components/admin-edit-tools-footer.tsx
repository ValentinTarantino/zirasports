import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import AdminEditToolsToggle from "@/components/admin-edit-tools-toggle";

export default async function AdminEditToolsFooter() {
  const session = await auth();
  return session?.user.role === UserRole.SUPER_ADMIN ? <AdminEditToolsToggle /> : null;
}
