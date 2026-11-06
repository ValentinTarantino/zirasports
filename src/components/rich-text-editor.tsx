"use client";

import { useRef, useState, type FocusEvent } from "react";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function markdownToHtml(value: string) {
  return value.split(/(\*\*[^*\n]+?\*\*)/g).map((part) => {
    const bold = part.match(/^\*\*(.+)\*\*$/);
    return bold ? `<strong>${escapeHtml(bold[1])}</strong>` : escapeHtml(part).replace(/\n/g, "<br>");
  }).join("");
}

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";
  if (node.tagName === "BR") return "\n";
  const content = Array.from(node.childNodes, serializeNode).join("");
  if (node.tagName === "STRONG" || node.tagName === "B") return `**${content}**`;
  if (node.tagName === "DIV" || node.tagName === "P") return `${content}\n`;
  return content;
}

function serializeEditor(editor: HTMLDivElement) {
  return Array.from(editor.childNodes, serializeNode).join("").replace(/\n{2,}/g, "\n").replace(/\n+$/, "");
}

export default function RichTextEditor({ name, value, onBlur }: { name: string; value: string; onBlur?: (value: string, form: HTMLFormElement | null) => void }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [boldActive, setBoldActive] = useState(false);

  function syncValue() {
    const editor = editorRef.current;
    if (!editor) return "";
    const serialized = serializeEditor(editor);
    if (hiddenInputRef.current) hiddenInputRef.current.value = serialized;
    return serialized;
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.relatedTarget instanceof Node && wrapperRef.current?.contains(event.relatedTarget)) return;
    onBlur?.(syncValue(), wrapperRef.current?.closest("form") ?? null);
  }

  function toggleBold() {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const wasActive = document.queryCommandState("bold");
    document.execCommand("bold");
    setBoldActive(!wasActive);
    syncValue();
  }

  return <div ref={wrapperRef} className="mt-2 overflow-hidden rounded-md border border-sky-200 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600">
    <input ref={hiddenInputRef} type="hidden" name={name} defaultValue={value} />
    <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Texto del párrafo" onInput={syncValue} onBlur={handleBlur} onKeyUp={() => setBoldActive(document.queryCommandState("bold"))} onMouseUp={() => setBoldActive(document.queryCommandState("bold"))} dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }} className="min-h-24 w-full whitespace-pre-wrap break-words px-3 py-2 text-sm font-normal text-zinc-900 outline-none" />
    <div className="border-t border-sky-100 bg-sky-50/70 px-2 py-1.5">
      <button type="button" aria-pressed={boldActive} onMouseDown={(event) => event.preventDefault()} onClick={toggleBold} className={`min-w-9 rounded border px-2 py-1 text-xs transition ${boldActive ? "border-sky-900 bg-sky-900 text-white" : "border-sky-300 bg-white text-sky-950 hover:bg-sky-100"}`} aria-label="Activar o desactivar negrita"><strong>B</strong></button>
    </div>
  </div>;
}
