import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-white px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">Acceso privado</p>
        <h1 className="mt-3 text-3xl font-black text-black">Ingresar al panel</h1>
        <p className="mt-3 text-sm text-zinc-600">Usá tus credenciales de administrador o editor.</p>
        <LoginForm />
      </div>
    </section>
  );
}
