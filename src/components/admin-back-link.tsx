import Link from "next/link";

export default function AdminBackLink() {
  return <Link href="/admin" className="mb-6 inline-flex items-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 transition hover:border-black hover:bg-zinc-50 hover:text-black">← Volver al panel</Link>;
}
