"use client";

import { signOut } from "next-auth/react";

export default function AdminSignOut() {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="mt-1 block w-full px-3 py-2 text-left text-sm font-semibold text-zinc-600 hover:text-black">
      Cerrar sesión
    </button>
  );
}
