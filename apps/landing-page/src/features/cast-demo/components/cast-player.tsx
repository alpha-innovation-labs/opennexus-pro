"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { createCastPlayer } from "../utils/create-cast-player";

/**
 * Renders and hydrates the Asciinema-powered terminal recording.
 *
 * @returns The cast player mount and script loader.
 */
export function CastPlayer() {
  const targetRef = useRef<HTMLDivElement>(null);
  const hasMountedPlayer = useRef(false);
  const [isScriptReady, setIsScriptReady] = useState(false);

  useEffect(() => {
    if (!isScriptReady || !targetRef.current || hasMountedPlayer.current) return;
    createCastPlayer(targetRef.current);
    hasMountedPlayer.current = true;
  }, [isScriptReady]);

  /** Marks the external Asciinema script as ready for player creation. */
  function handleScriptReady(): void {
    setIsScriptReady(true);
  }

  return (
    <>
      <Script src="/asciinema/asciinema-player.min.js" strategy="afterInteractive" onReady={handleScriptReady} />
      <div ref={targetRef} className="nexus-cast-player overflow-hidden bg-[#1f2430]" data-cast-src="/recordings/demo.cast" aria-label="Nexus terminal recording" />
    </>
  );
}
