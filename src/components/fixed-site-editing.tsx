"use client";

import { SiteContentKind } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent, type FocusEvent } from "react";
import { useFormStatus } from "react-dom";
import { deleteFixedSiteMedia, saveFixedSiteContent, saveFixedSiteMedia, setSiteEditMode } from "@/app/actions/site-content";
import type { FixedSiteContentKey } from "@/lib/site-content";
import { formatInlineText } from "@/lib/inline-format";
import RichTextEditor from "@/components/rich-text-editor";
import PauseOffscreenMedia from "@/components/pause-offscreen-media";

export function SiteEditModeControl({ enabled }: { enabled: boolean }) {
  return (
    <section className="admin-editing-ui mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
      <div>
        <p className="font-bold text-zinc-950">Modo de edición {enabled ? "activado" : "desactivado"}</p>
        <p className="mt-1 text-sm text-zinc-600">{enabled ? "Podés editar los textos y recursos multimedia de los espacios definidos." : "La estructura de la portada permanece fija."}</p>
      </div>
      <form action={setSiteEditMode}>
        <input type="hidden" name="enabled" value={enabled ? "false" : "true"} />
        <EditModeSubmitButton enabled={enabled} />
      </form>
    </section>
  );
}

function EditModeSubmitButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70 ${enabled ? "bg-zinc-700 hover:bg-zinc-800" : "bg-black hover:bg-zinc-800"}`}>
    {pending && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />}
    {pending ? (enabled ? "Desactivando…" : "Activando…") : (enabled ? "Desactivar edición" : "Activar modo edición")}
  </button>;
}

export function FixedText({
  contentKey,
  value,
  editMode,
  label,
  as = "p",
  multiline = false,
  enableBold = false,
  className = "",
}: {
  contentKey: string;
  value: string;
  editMode: boolean;
  label: string;
  as?: "p" | "h1" | "h2" | "h3" | "span";
  multiline?: boolean;
  enableBold?: boolean;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const Tag = as;
  const lastSavedValue = useRef(value);

  if (!editMode) return <Tag className={className}>{enableBold ? formatInlineText(value) : value}</Tag>;

  function submit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await saveFixedSiteContent(formData);
      lastSavedValue.current = String(formData.get("value") ?? "");
      setSaved(true);
      router.refresh();
    });
  }

  function autoSave(event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (event.currentTarget.value === lastSavedValue.current) return;
    event.currentTarget.form?.requestSubmit();
  }

  function autoSaveRichText(nextValue: string, form: HTMLFormElement | null) {
    if (nextValue !== lastSavedValue.current) form?.requestSubmit();
  }

  return (
    <form action={submit} className="admin-editing-ui rounded-lg border border-dashed border-sky-500 bg-sky-50/70 p-3">
      <input type="hidden" name="key" value={contentKey} />
      {multiline && enableBold ? <><span className="block text-xs font-bold text-sky-950">Editar {label}</span><RichTextEditor name="value" value={value} onBlur={autoSaveRichText} /></> : <label className="block text-xs font-bold text-sky-950">Editar {label}
        {multiline ? <textarea name="value" rows={3} maxLength={10000} defaultValue={value} onBlur={autoSave} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-zinc-900" /> : <input name="value" maxLength={10000} defaultValue={value} onBlur={autoSave} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-zinc-900" />}
      </label>}
      <div className="mt-2 min-h-5" aria-live="polite">
        {isPending && <span className="text-xs font-semibold text-sky-700">Guardando…</span>}
        {!isPending && saved && <span className="text-xs font-semibold text-green-700">Guardado automáticamente</span>}
      </div>
    </form>
  );
}

export function FixedMedia({
  contentKey,
  value,
  kind,
  editMode,
  label,
}: {
  contentKey: FixedSiteContentKey;
  value: string;
  kind: "IMAGE" | "VIDEO";
  editMode: boolean;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const isDirectVideoFile = kind === SiteContentKind.VIDEO && /\.(mp4|webm|ogg)(?:$|\?)/i.test(value);

  function submit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await saveFixedSiteContent(formData);
      setSaved(true);
      router.refresh();
    });
  }

  if (!value && !editMode) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      {value ? (
        kind === SiteContentKind.IMAGE ? (
          <div className="relative aspect-[16/10] bg-zinc-100"><Image src={value} alt={label} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
        ) : isDirectVideoFile ? (
          <PauseOffscreenMedia className="aspect-video bg-black"><video src={value} title={label} className="h-full w-full" controls playsInline preload="metadata" /></PauseOffscreenMedia>
        ) : (
          <PauseOffscreenMedia className="aspect-video bg-black"><iframe src={value} title={label} className="h-full w-full" allowFullScreen /></PauseOffscreenMedia>
        )
      ) : <div className="grid aspect-[16/10] place-items-center bg-zinc-100 p-4 text-center text-sm text-zinc-500">Espacio reservado para {label.toLowerCase()}</div>}
      {editMode && <form action={submit} className="admin-editing-ui border-t border-sky-200 bg-sky-50 p-3">
        <input type="hidden" name="key" value={contentKey} />
        <label className="block text-xs font-bold text-sky-950">URL de {label.toLowerCase()}
          <input name="value" type="url" defaultValue={value} placeholder="https://..." className="mt-1 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-zinc-900" />
        </label>
        <div className="mt-2 flex items-center gap-3"><button disabled={isPending} className="rounded-md bg-sky-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">{isPending ? "Guardando…" : "Guardar recurso"}</button>{saved && <span aria-live="polite" className="text-xs font-semibold text-green-700">Guardado</span>}</div>
      </form>}
    </div>
  );
}

export function FixedMediaEditor({ contentKey, value, label, editMode, kind = "IMAGE", allowVideo = false }: { contentKey: string; value: string; label: string; editMode: boolean; kind?: "IMAGE" | "VIDEO"; allowVideo?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [selectedKind, setSelectedKind] = useState<"IMAGE" | "VIDEO">(kind);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const router = useRouter();

  if (editMode !== true) return null;

  function submit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await saveFixedSiteMedia(formData);
      setSaved(true);
      router.refresh();
    });
  }

  async function compressImage(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size < 300_000) return file;
    try {
      const bitmap = await createImageBitmap(file);
      const maxDimension = 2400;
      const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
      if (!blob || blob.size >= file.size) return file;
      return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp", lastModified: Date.now() });
    } catch {
      return file;
    }
  }

  async function uploadFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadProgress(0);
    setUploadMessage("Iniciando subida...");
    const form = event.currentTarget;
    const selectedFile = form.querySelector<HTMLInputElement>('input[name="file"]')?.files?.[0];
    const file = selectedFile && selectedKind === "IMAGE" ? await compressImage(selectedFile) : selectedFile;
    if (selectedFile && file && file.size < selectedFile.size) {
      setUploadMessage(`Imagen optimizada: ${(selectedFile.size / 1024 / 1024).toFixed(1)} MB → ${(file.size / 1024 / 1024).toFixed(1)} MB`);
    }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/site-media-upload");
    xhr.upload.onprogress = (progressEvent) => {
      if (!progressEvent.lengthComputable) return;
      const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      setUploadProgress(percentage);
      setUploadMessage(`Subiendo... ${percentage}%`);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadProgress(100);
        setUploadMessage("Subida completa");
        router.refresh();
        return;
      }
      let message = "No se pudo subir el archivo.";
      try { message = JSON.parse(xhr.responseText).error ?? message; } catch { /* respuesta no JSON */ }
      setUploadProgress(null);
      setUploadMessage(message);
    };
    xhr.onerror = () => { setUploadProgress(null); setUploadMessage("La conexión se interrumpió durante la subida."); };
    xhr.onabort = () => { setUploadProgress(null); setUploadMessage("Subida cancelada."); };
    const formData = new FormData(form);
    if (file) formData.set("file", file);
    xhr.send(formData);
  }

  return <div className="admin-editing-ui border-t border-sky-200 bg-sky-50 p-3" onClick={(event) => event.stopPropagation()}>
    <form action={submit}>
      <input type="hidden" name="key" value={contentKey} />
      <input type="hidden" name="kind" value={selectedKind} />
      {allowVideo && <label className="block text-xs font-bold text-sky-950">Tipo de recurso
        <select value={selectedKind} onChange={(event) => setSelectedKind(event.target.value as "IMAGE" | "VIDEO")} className="mt-1 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-zinc-900">
          <option value="IMAGE">Imagen</option>
          <option value="VIDEO">Video</option>
        </select>
      </label>}
      <label className="block text-xs font-bold text-sky-950">URL de {label.toLowerCase()}
        <input name="value" type="url" defaultValue={value.startsWith("/") ? "" : value} placeholder="https://..." className="mt-1 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-zinc-900" />
      </label>
      <div className="mt-2 flex items-center gap-3"><button disabled={isPending} className="rounded-md bg-sky-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">{isPending ? "Guardando…" : "Guardar imagen"}</button>{saved && <span className="text-xs font-semibold text-green-700">Guardado</span>}</div>
    </form>
    {value && <form action={deleteFixedSiteMedia} onSubmit={(event) => { if (!window.confirm("¿Eliminar este recurso?")) event.preventDefault(); }} className="mt-2">
      <input type="hidden" name="key" value={contentKey} />
      <button className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-bold text-white">Eliminar recurso</button>
    </form>}
    <form onSubmit={uploadFile} className="mt-3 border-t border-sky-200 pt-3">
      <input type="hidden" name="key" value={contentKey} />
      <input type="hidden" name="kind" value={selectedKind} />
      <label className="block text-xs font-bold text-sky-950">Subir desde la PC
        <input name="file" type="file" accept={selectedKind === "VIDEO" ? "video/mp4,video/webm,video/ogg" : "image/jpeg,image/png,image/webp,image/gif,image/avif"} required className="mt-1 block w-full text-xs font-normal text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-sky-900 file:px-3 file:py-1.5 file:font-bold file:text-white" />
      </label>
      <button disabled={uploadProgress !== null && uploadProgress < 100} className="mt-2 rounded-md bg-sky-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">Subir {selectedKind === "VIDEO" ? "video" : "imagen"}</button>
      {uploadProgress !== null && <div className="mt-3" aria-live="polite"><div className="h-2 overflow-hidden rounded-full bg-sky-200"><div className="h-full bg-sky-700 transition-[width]" style={{ width: `${uploadProgress}%` }} /></div><p className="mt-1 text-xs font-semibold text-sky-900">{uploadMessage}</p></div>}
      {uploadProgress === null && uploadMessage && <p className="mt-2 text-xs font-semibold text-red-700" aria-live="polite">{uploadMessage}</p>}
      <p className="mt-1 text-[11px] text-sky-900/70">{selectedKind === "VIDEO" ? "MP4, WEBM u OGG · máximo 500 MB" : "JPG, PNG, WEBP, GIF o AVIF · máximo 50 MB"}</p>
    </form>
  </div>;
}

export function StoryCard({
  imageKey,
  image,
  labelKey,
  label,
  titleKey,
  title,
  bodyKey,
  body,
  editMode,
  size,
  sectionId,
  href,
  wide = false,
}: {
  imageKey: FixedSiteContentKey;
  image: string;
  labelKey: FixedSiteContentKey;
  label: string;
  titleKey: FixedSiteContentKey;
  title: string;
  bodyKey?: FixedSiteContentKey;
  body?: string;
  editMode: boolean;
  size: "hero" | "side" | "small";
  sectionId?: string;
  href?: string;
  wide?: boolean;
}) {
  const aspect = size === "hero" ? "aspect-[16/10] sm:aspect-[16/9]" : size === "side" ? "aspect-[16/9]" : "aspect-[4/3]";
  const titleClass = size === "hero" ? "text-3xl sm:text-5xl lg:text-6xl" : size === "side" ? "text-xl sm:text-2xl" : "text-lg sm:text-xl";
  return <article id={sectionId} className={`group relative overflow-hidden rounded-xl bg-white text-black sm:bg-zinc-900 sm:text-white ${wide ? "md:col-span-2" : ""} ${editMode ? "ring-2 ring-sky-400" : ""}`}>
    {!editMode && href && <Link href={href} aria-label={`Ver ${title}`} className="absolute inset-0 z-10" />}
    <div className={`relative ${aspect}`}>
      {image ? <Image src={image} alt={title} fill sizes={size === "hero" ? "(max-width: 1024px) 100vw, 70vw" : "(max-width: 1024px) 100vw, 30vw"} loading={size === "hero" ? "eager" : "lazy"} className="object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-950" />}
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-black via-black/35 to-transparent sm:block" />
    </div>
    <div className={`relative p-4 sm:p-5 lg:p-6 [&_h2]:text-black sm:[&_h2]:text-white [&_p]:text-black sm:[&_p]:text-zinc-200 [&_p:first-child]:text-pink-600 sm:[&_p:first-child]:text-pink-300 ${editMode ? "" : "sm:absolute sm:inset-x-0 sm:bottom-0"}`}>
      {editMode ? <div className="space-y-2"><FixedText contentKey={labelKey} value={label} editMode label="etiqueta" className="text-xs font-black uppercase tracking-widest text-pink-300" /><FixedText contentKey={titleKey} value={title} editMode label="título" as="h2" className={`${titleClass} font-black leading-[0.95] text-white`} />{bodyKey && <FixedText contentKey={bodyKey} value={body ?? ""} editMode label="bajada" multiline className="text-sm text-zinc-200" />}</div> : <><p className="text-xs font-black uppercase tracking-widest text-pink-300">{label}</p><h2 className={`${titleClass} mt-2 font-black leading-[0.95] text-white`}>{title}</h2>{body && <p className="mt-3 max-w-2xl text-sm leading-5 text-zinc-200">{body}</p>}</>}
    </div>
    <FixedMediaEditor contentKey={imageKey} value={image} label="imagen" editMode={editMode} />
  </article>;
}
