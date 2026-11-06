import { updatePostContent } from "@/app/actions/posts";

function EditBlock({ id, name, label, value, multiline = false }: { id: string; name: string; label: string; value: string; multiline?: boolean }) {
  return <form action={updatePostContent} className="mt-4 rounded-xl border border-dashed border-sky-300 bg-sky-50 p-4"><input type="hidden" name="id" value={id} /><label className="block text-sm font-bold text-sky-950">{label}{multiline ? <textarea name={name} defaultValue={value} rows={4} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" /> : <input name={name} defaultValue={value} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-black" />}</label><button className="mt-3 rounded-md bg-sky-900 px-4 py-2 text-sm font-bold text-white">Guardar cambios</button></form>;
}

export default function PostEditFields({ id, title, excerpt, image, paragraphs }: { id: string; title: string; excerpt: string; image: string; paragraphs: string[] }) {
  return <div className="space-y-1"><EditBlock id={id} name="title" label="Editar titulo" value={title} /><EditBlock id={id} name="excerpt" label="Editar resumen" value={excerpt} multiline /><EditBlock id={id} name="image" label="URL de imagen" value={image} />{[1, 2, 3, 4, 5].map((index) => <EditBlock key={index} id={id} name={`paragraph${index}`} label={`Editar parrafo ${index}`} value={paragraphs[index - 1] ?? ""} multiline />)}</div>;
}
