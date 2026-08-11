"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { mountShowcaseTerminalPlayer } from "../utils/mount-showcase-terminal-player";
import { waitForAsciinemaPlayer } from "../utils/wait-for-asciinema-player";

export type ShowcaseTerminalPlayerProps = {
  readonly castSrc: string;
  readonly title: string;
};

type AsciinemaPlayerInstance = {
  readonly dispose?: () => void;
};

/**
 * Renders the scroll-synced Asciinema recording inside the showcase terminal frame.
 *
 * @param props Active recording source and title.
 * @returns A terminal recording mount with the Asciinema script loader.
 */
export function ShowcaseTerminalPlayer(props: ShowcaseTerminalPlayerProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<AsciinemaPlayerInstance | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    /** Mounts the active recording after the script and element are both ready. */
    async function mountActiveRecording(): Promise<void> {
      const hasRuntime = await waitForAsciinemaPlayer(abortController.signal);
      const target = targetRef.current;
      if (!hasRuntime || abortController.signal.aborted || !target) return;

      playerRef.current?.dispose?.();
      playerRef.current = mountShowcaseTerminalPlayer(target, props.castSrc);
    }

    void mountActiveRecording();

    return () => {
      abortController.abort();
      playerRef.current?.dispose?.();
      playerRef.current = null;
      targetRef.current?.replaceChildren();
    };
  }, [props.castSrc]);

  return (
    <>
      <Script src="/asciinema/asciinema-player.min.js" strategy="afterInteractive" />
      <div ref={targetRef} className="showcase-terminal-player overflow-hidden bg-black" data-cast-src={props.castSrc} />
    </>
  );
}
