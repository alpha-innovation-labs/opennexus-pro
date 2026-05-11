import type { ShowcaseExample as ShowcaseExampleContent } from "../types/showcase-feature";
import { ShowcaseVideo } from "./showcase-video";

export type ShowcaseExampleProps = {
  readonly example: ShowcaseExampleContent;
};

/**
 * Renders one feature example with copy and a visual summary.
 *
 * @param props Feature example content.
 * @returns A showcase example row.
 */
export function ShowcaseExample(props: ShowcaseExampleProps) {
  return (
    <article className="showcase-example grid scroll-mt-32 grid-cols-[minmax(0,0.88fr)_minmax(18rem,1.12fr)] overflow-hidden border border-neutral-200/70 bg-neutral-50/80 dark:border-white/10 dark:bg-black/40 max-[860px]:grid-cols-1" id={props.example.id} data-showcase-child={props.example.id}>
      <div className="feature-copy-card grid content-start gap-4 p-[clamp(1.25rem,3vw,2.5rem)]">
        <p className="eyebrow m-0 font-mono text-xs font-semibold uppercase leading-tight tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
          {props.example.eyebrow}
        </p>
        <h3 className="m-0 text-[clamp(1.35rem,1.75vw,1.8rem)] font-semibold leading-tight tracking-[-0.035em] text-neutral-950 text-balance dark:text-neutral-100">
          {props.example.title}
        </h3>
        <p className="m-0 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">{props.example.body}</p>
        <ul className="m-0 grid list-none gap-2 p-0">
          {props.example.bullets.map((bullet) => <li className="font-mono text-xs font-semibold leading-relaxed text-neutral-800 dark:text-neutral-200" key={bullet}>{bullet}</li>)}
        </ul>
      </div>
      <ShowcaseVideo title={props.example.title} bullets={props.example.bullets} />
    </article>
  );
}
