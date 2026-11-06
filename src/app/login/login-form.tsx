"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(false);
    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setError(true);
      setIsLoading(false);
      return;
    }
    router.push("/admin");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="block text-sm font-semibold text-zinc-800">
        Email
        <input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-black" />
      </label>
      <label className="block text-sm font-semibold text-zinc-800">
        Contraseña
        <input name="password" type="password" required autoComplete="current-password" className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-black" />
      </label>
      {error && <p className="text-sm font-medium text-red-600">Las credenciales no son válidas.</p>}
      <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-black px-4 py-3 font-bold text-white transition hover:bg-zinc-800 disabled:opacity-60">
        {isLoading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
