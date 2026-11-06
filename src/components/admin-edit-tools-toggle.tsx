"use client";

import { useEffect, useSyncExternalStore } from "react";

const storageKey = "zirasport-hide-edit-tools";
const storageChangeEvent = "zirasport-edit-tools-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(storageChangeEvent, onStoreChange);
  return () => window.removeEventListener(storageChangeEvent, onStoreChange);
}

function getSnapshot() {
  return window.sessionStorage.getItem(storageKey) === "true";
}

function getServerSnapshot() {
  return false;
}

export default function AdminEditToolsToggle() {
  const hidden = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.classList.toggle("hide-admin-editing", hidden);
  }, [hidden]);

  function toggle() {
    const nextHidden = !hidden;
    window.sessionStorage.setItem(storageKey, String(nextHidden));
    window.dispatchEvent(new Event(storageChangeEvent));
  }

  return <button type="button" aria-pressed={hidden} onClick={toggle} className="mt-2 rounded-full border border-zinc-600 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-pink-500 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500">{hidden ? "Mostrar herramientas de edición" : "Ocultar herramientas de edición"}</button>;
}
