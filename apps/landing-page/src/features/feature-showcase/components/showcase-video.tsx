export type ShowcaseVideoProps = {
  readonly title: string;
  readonly bullets: readonly string[];
};

/**
 * Renders the visual summary card for one feature example.
 *
 * @param props Showcase title and outcome bullets.
 * @returns The terminal-inspired visual card.
 */
export function ShowcaseVideo(props: ShowcaseVideoProps) {
  return (
    <aside className="feature-video-card bg-neutral-950 p-5 text-neutral-100 max-[860px]:hidden" aria-label={`${props.title} visual summary`}>
      <div className="terminal-bar mb-5 flex items-center gap-2 font-mono text-sm font-semibold">
        <span className="terminal-dot h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="terminal-dot h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="terminal-dot h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="terminal-title ml-2 text-neutral-300">nexus / {props.title}</span>
      </div>
      <div className="feature-video-preview grid min-h-[20rem] place-items-center rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(129,140,248,0.26),transparent_34%),linear-gradient(135deg,#020617,#111827)] p-8" aria-hidden="true">
        <div className="feature-preview-window grid w-full max-w-md gap-4 rounded-2xl border border-white/10 bg-black/35 p-6 shadow-2xl">
          <span className="feature-preview-kicker font-mono text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">bundled workflow</span>
          <strong className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-balance">{props.title}</strong>
          <div className="feature-preview-rows grid gap-2 font-mono text-xs font-medium">
            {props.bullets.slice(0, 3).map((bullet) => <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-neutral-200" key={bullet}>{bullet}</span>)}
          </div>
        </div>
      </div>
    </aside>
  );
}
