"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deletePostMedia, updatePostContent } from "@/app/actions/posts";

export default function PostMainImageEditor({ postId, value, editMode }: { postId: string; value: string; editMode: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  if (!editMode) return null;

  function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMessage("Elegí una imagen primero.");
      return;
    }
    const data = new FormData();
    data.set("key", `post:${postId}:main-image`);
    data.set("kind", "IMAGE");
    data.set("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/site-media-upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setProgress(Math.round(event.loaded / event.total * 100));
    };
    xhr.onload = () => {
      let result: { error?: string } = {};
      try { result = JSON.parse(xhr.responseText); } catch { /* respuesta no JSON */ }
      if (xhr.status < 200 || xhr.status >= 300) {
        setMessage(result.error ?? "No se pudo subir la imagen.");
        setProgress(null);
        return;
      }
      setProgress(100);
      setMessage("Subida completa");
      router.refresh();
    };
    xhr.onerror = () => { setMessage("La conexión se interrumpió durante la subida."); setProgress(null); };
    xhr.send(data);
    setMessage("Subiendo imagen...");
    setProgress(0);
  }

  return <div className="admin-editing-ui border-t border-sky-200 bg-sky-50 p-3">
    <form action={(formData) => startTransition(async () => { await updatePostContent(formData); setMessage("Guardado"); router.refresh(); })}>
      <input type="hidden" name="id" value={postId} />
      <label className="block text-xs font-bold text-sky-950">URL de imagen principal<input name="image" type="url" defaultValue={value.startsWith("/") ? "" : value} placeholder="https://..." className="mt-1 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-zinc-900" /></label>
      <button disabled={pending} className="mt-2 rounded-md bg-sky-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">{pending ? "Guardando..." : "Guardar imagen"}</button>
      {!pending && message === "Guardado" && <span className="ml-3 text-xs font-semibold text-green-700">Guardado</span>}
    </form>
    <form onSubmit={(event) => { event.preventDefault(); upload(); }} className="mt-3 border-t border-sky-200 pt-3">
      <label className="block text-xs font-bold text-sky-950">Subir desde la PC<input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="mt-2 block w-full text-xs font-normal text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-sky-900 file:px-3 file:py-1.5 file:font-bold file:text-white" /></label>
      <button type="submit" disabled={progress !== null && progress < 100} className="mt-2 rounded-md bg-sky-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">Subir imagen</button>
      {progress !== null && <div className="mt-3" aria-live="polite"><div className="h-2 overflow-hidden rounded-full bg-sky-200"><div className="h-full bg-sky-700 transition-[width]" style={{ width: `${progress}%` }} /></div><p className="mt-1 text-xs font-semibold text-sky-900">{message} {progress < 100 ? `${progress}%` : ""}</p></div>}
      {progress === null && message && message !== "Guardado" && <p className="mt-2 text-xs font-semibold text-red-700" aria-live="polite">{message}</p>}
      <p className="mt-2 text-[11px] text-sky-900/70">JPG, PNG, WEBP, GIF o AVIF · máximo 50 MB</p>
    </form>
    {value && <form action={(formData) => startTransition(async () => { await deletePostMedia(formData); setMessage("Imagen eliminada"); router.refresh(); })} onSubmit={(event) => { if (!window.confirm("¿Eliminar la imagen principal y su pie de foto?")) event.preventDefault(); }} className="mt-3">
      <input type="hidden" name="id" value={postId} />
      <input type="hidden" name="target" value="main-image" />
      <button disabled={pending} className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">Eliminar imagen</button>
    </form>}
  </div>;
}
