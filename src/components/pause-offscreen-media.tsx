"use client";

import { useEffect, useRef, type ReactNode } from "react";

function pauseEmbeddedPlayer(frame: HTMLIFrameElement) {
  const source = frame.src;
  if (/youtube(?:-nocookie)?\.com/i.test(source)) {
    frame.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), new URL(source).origin);
  } else if (/vimeo\.com/i.test(source)) {
    frame.contentWindow?.postMessage(JSON.stringify({ method: "pause" }), new URL(source).origin);
  }
}

export default function PauseOffscreenMedia({ children, className }: { children: ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.querySelectorAll("iframe").forEach((frame) => {
      if (!/youtube(?:-nocookie)?\.com/i.test(frame.src)) return;
      const playerUrl = new URL(frame.src);
      if (playerUrl.searchParams.get("enablejsapi") === "1") return;
      playerUrl.searchParams.set("enablejsapi", "1");
      playerUrl.searchParams.set("origin", window.location.origin);
      frame.src = playerUrl.toString();
    });

    const pauseMedia = (stopEmbeds = false) => {
      container.querySelectorAll("video").forEach((video) => video.pause());
      container.querySelectorAll("iframe").forEach((frame) => {
        pauseEmbeddedPlayer(frame);
        if (stopEmbeds) frame.src = "about:blank";
      });
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.05) pauseMedia();
    }, { threshold: 0.05 });
    observer.observe(container);

    const pauseBeforeNavigation = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (link) pauseMedia(true);
    };
    const pauseWhenTabHidden = () => {
      if (document.hidden) pauseMedia();
    };
    const stopBeforeLeavingPage = () => pauseMedia(true);
    document.addEventListener("click", pauseBeforeNavigation, true);
    document.addEventListener("visibilitychange", pauseWhenTabHidden);
    window.addEventListener("popstate", stopBeforeLeavingPage);
    window.addEventListener("pagehide", stopBeforeLeavingPage);
    window.addEventListener("beforeunload", stopBeforeLeavingPage);

    return () => {
      pauseMedia(true);
      observer.disconnect();
      document.removeEventListener("click", pauseBeforeNavigation, true);
      document.removeEventListener("visibilitychange", pauseWhenTabHidden);
      window.removeEventListener("popstate", stopBeforeLeavingPage);
      window.removeEventListener("pagehide", stopBeforeLeavingPage);
      window.removeEventListener("beforeunload", stopBeforeLeavingPage);
    };
  }, []);

  return <div ref={containerRef} className={className}>{children}</div>;
}
