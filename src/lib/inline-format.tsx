import type { ReactNode } from "react";

export function formatInlineText(value: string): ReactNode[] {
  return value.split(/(\*\*[^*\n]+?\*\*)/g).map((part, index) => {
    const boldMatch = part.match(/^\*\*(.+)\*\*$/);
    return boldMatch ? <strong key={index}>{boldMatch[1]}</strong> : part;
  });
}

