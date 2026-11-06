"use client";

export default function DeletePostButton({ id, title, action }: { id: string; title: string; action: (formData: FormData) => void | Promise<void> }) {
  return <form action={action} onSubmit={(event) => { if (!window.confirm(`¿Eliminar la noticia "${title}"? Esta acción no se puede deshacer.`)) event.preventDefault(); }}>
    <input type="hidden" name="id" value={id} />
    <button type="submit" aria-label={`Eliminar ${title}`} title="Eliminar noticia" className="inline-flex rounded-lg p-2 text-red-600 transition hover:bg-red-50 hover:text-red-800">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 6V4h6v2m-9 0 1 15h8l1-15M10 11v6m4-6v6" /></svg>
    </button>
  </form>;
}
