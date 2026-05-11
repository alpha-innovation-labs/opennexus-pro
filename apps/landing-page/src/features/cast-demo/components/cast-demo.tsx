import { castDemoSteps } from "../data/cast-demo-steps";
import { CastDemoStep } from "./cast-demo-step";
import { CastPlayer } from "./cast-player";

/**
 * Renders the landing page terminal recording demo with sticky copy.
 *
 * @returns The cast demo section.
 */
export function CastDemo() {
  return (
    <section className="cast-demo-section relative grid min-h-[150vh] grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] gap-[clamp(1.5rem,4vw,3rem)] border-b border-neutral-200/60 bg-neutral-50 p-[clamp(1.5rem,4vw,3.5rem)] dark:border-white/10 dark:bg-black max-[860px]:block max-[860px]:min-h-0 max-[860px]:px-4 max-[860px]:py-3" id="demo" aria-labelledby="cast-demo-title">
      <div className="cast-demo-player-shell sticky top-20 z-30 grid min-h-[min(40rem,calc(100vh-7rem))] place-items-center self-start overflow-visible bg-transparent p-0 max-[860px]:relative max-[860px]:top-auto max-[860px]:min-h-0">
        <div className="cast-terminal-frame w-full max-w-[47rem] overflow-hidden rounded-2xl border border-neutral-300/80 bg-black shadow-[0_28px_80px_rgba(0,0,0,0.18)] dark:border-white/20 max-[860px]:max-h-none">
          <div className="cast-terminal-bar flex items-center gap-2 border-b border-white/10 bg-neutral-950 px-4 py-3" aria-hidden="true">
            <span className="cast-terminal-dot h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="cast-terminal-dot h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="cast-terminal-dot h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="cast-terminal-title ml-3 font-mono text-[0.68rem] font-bold uppercase leading-none tracking-[0.28em] text-neutral-400">Nexus</span>
          </div>
          <CastPlayer />
        </div>
      </div>
      <div className="cast-demo-scroll-copy sticky top-28 z-40 grid w-full gap-8 self-start bg-transparent pt-8 pb-8 max-[860px]:relative max-[860px]:top-auto max-[860px]:pt-8 max-[860px]:pb-0">
        {castDemoSteps.map((step, index) => <CastDemoStep key={step.title} step={step} index={index} />)}
      </div>
    </section>
  );
}
