"use client";

import { useRef, useState, useTransition, type FocusEvent } from "react";
import { updatePostContent } from "@/app/actions/posts";
import { formatInlineText } from "@/lib/inline-format";
import RichTextEditor from "@/components/rich-text-editor";

export default function PostInlineText({ id, name, value, label, editMode, as = "p", multiline = false, enableBold = false, className = "" }: { id: string; name: string; value: string; label: string; editMode: boolean; as?: "p" | "h1" | "h2" | "h3"; multiline?: boolean; enableBold?: boolean; className?: string }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const lastSaved = useRef(value);
  if (!editMode) {
    const content = enableBold ? formatInlineText(value) : value;
    if (as === "h1") return <h1 className={className}>{content}</h1>;
    if (as === "h2") return <h2 className={className}>{content}</h2>;
    if (as === "h3") return <h3 className={className}>{content}</h3>;
    return <p className={className}>{content}</p>;
  }
  function save(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await updatePostContent(formData);
      lastSaved.current = String(formData.get(name) ?? "");
      setSaved(true);
    });
  }
  function saveOnBlur(event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (event.currentTarget.value !== lastSaved.current) event.currentTarget.form?.requestSubmit();
  }
  function saveRichText(nextValue: string, form: HTMLFormElement | null) {
    if (nextValue !== lastSaved.current) form?.requestSubmit();
  }
  return <form action={save} className="admin-editing-ui rounded-lg border border-dashed border-sky-500 bg-sky-50/70 p-3"><input type="hidden" name="id" value={id} />{multiline && enableBold ? <><span className="block text-xs font-bold text-sky-950">Editar {label}</span><RichTextEditor name={name} value={value} onBlur={saveRichText} /></> : <label className="block text-xs font-bold text-sky-950">Editar {label}{multiline ? <textarea name={name} rows={3} maxLength={10000} defaultValue={value} onBlur={saveOnBlur} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-zinc-900" /> : <input name={name} maxLength={10000} defaultValue={value} onBlur={saveOnBlur} className="mt-2 block w-full rounded-md border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-zinc-900" />}</label>}<div className="mt-2 min-h-5" aria-live="polite">{pending && <span className="text-xs font-semibold text-sky-700">Guardando...</span>}{!pending && saved && <span className="text-xs font-semibold text-green-700">Guardado automáticamente</span>}</div></form>;
}
