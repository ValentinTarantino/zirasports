"use client";

import Image from "next/image";
import PauseOffscreenMedia from "@/components/pause-offscreen-media";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deletePostMedia, updatePostContent } from "@/app/actions/posts";

type MediaKind = "IMAGE" | "VIDEO";

export default function PostParagraphMediaEditor({ postId, paragraphNumber, value, kind, editMode }: { postId: string; paragraphNumber: number; value: string; kind: MediaKind; editMode: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedKind, setSelectedKind] = useState<MediaKind>(kind);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const name = `mediaUrl${paragraphNumber}`;

  function upload() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setMessage("Elegí un archivo primero.");
      return;
    }
    const data = new FormData();
    data.set("key", `post:${postId}:paragraph:${paragraphNumber}:media`);
    data.set("kind", selectedKind);
    data.set("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/site-media-upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      const result = (() => { try { return JSON.parse(xhr.responseText); } catch { return {}; } })();
      if (xhr.status < 200 || xhr.status >= 300) {
        setMessage(result.error ?? "No se pudo subir el archivo.");
        setProgress(null);
        return;
      }
      setProgress(100);
      setMessage("Subida completa");
      router.refresh();
    };
    xhr.onerror = () => { setMessage("Error de conexión durante la subida."); setProgress(null); };
    xhr.send(data);
    setMessage("Subiendo...");
    setProgress(0);
  }

  return <div className="my-6">
    {value && <figure className="overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-black/5">
      {kind === "VIDEO" ? <PauseOffscreenMedia><video src={value} controls playsInline preload="metadata" className="max-h-[65vh] w-full bg-black" /></PauseOffscreenMedia> : <Image src={value} alt={`Multimedia del párrafo ${paragraphNumber}`} width={1200} height={700} className="h-auto max-h-[65vh] w-full object-cover" />}
    </figure>}
    {editMode && <div className="admin-editing-ui mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3">
      <form action={(formData) => { startTransition(async () => { await updatePostContent(formData); setMessage("Guardado"); }); }} className="space-y-2">
        <input type="hidden" name="id" value={postId} />
        <label className="block text-xs font-bold text-sky-950">Tipo de recurso<select name={`mediaKind${paragraphNumber}`} value={selectedKind} onChange={(event) => setSelectedKind(event.target.value as MediaKind)} className="mt-1 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-zinc-900"><option value="IMAGE">Imagen</option><option value="VIDEO">Video</option></select></label>
        <label className="block text-xs font-bold text-sky-950">URL de imagen o video<input name={name} defaultValue={value} placeholder="https://…" className="mt-1 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-zinc-900" /></label>
        <button type="submit" disabled={pending} className="rounded-md bg-sky-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">Guardar recurso</button>
      </form>
      <div className="mt-3 border-t border-sky-200 pt-3">
        <div>
          <p className="text-xs font-bold text-sky-950">Subir desde la PC</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <label htmlFor={`post-paragraph-file-${postId}-${paragraphNumber}`} className="cursor-pointer rounded-md bg-sky-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-sky-800">Examinar...</label>
            <span className="text-xs text-zinc-800">{selectedFileName || "No se ha seleccionado ningún archivo."}</span>
            <input id={`post-paragraph-file-${postId}-${paragraphNumber}`} ref={inputRef} type="file" accept={selectedKind === "VIDEO" ? "video/mp4,video/webm,video/ogg" : "image/avif,image/gif,image/jpeg,image/png,image/webp"} onChange={(event) => setSelectedFileName(event.currentTarget.files?.[0]?.name ?? "")} className="sr-only" />
          </div>
        </div>
        <button type="button" onClick={upload} className="mt-2 rounded-md bg-sky-900 px-3 py-1.5 text-xs font-bold text-white">Subir {selectedKind === "VIDEO" ? "video" : "imagen"}</button>
        {progress !== null && <div className="mt-2"><progress value={progress} max="100" className="w-full" /><p className="text-xs font-semibold text-sky-900">{message} {progress < 100 ? `${progress}%` : ""}</p></div>}
        {!progress && message && <p className={`mt-2 text-xs font-semibold ${message === "Guardado" ? "text-green-700" : "text-red-700"}`}>{message}</p>}
        <p className="mt-2 text-[11px] text-sky-700">Imágenes hasta 50 MB · videos MP4, WEBM u OGG hasta 500 MB.</p>
      </div>
      {value && <form action={(formData) => { startTransition(async () => { await deletePostMedia(formData); setMessage("Recurso eliminado"); router.refresh(); }); }} onSubmit={(event) => { if (!window.confirm("¿Eliminar este recurso y su pie de foto?")) event.preventDefault(); }} className="mt-3 border-t border-sky-200 pt-3">
        <input type="hidden" name="id" value={postId} />
        <input type="hidden" name="target" value="paragraph" />
        <input type="hidden" name="paragraph" value={paragraphNumber} />
        <button disabled={pending} className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">Eliminar {kind === "VIDEO" ? "video" : "imagen"}</button>
      </form>}
    </div>}
  </div>;
}
