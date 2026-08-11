import type { ShowcaseGroup as ShowcaseGroupContent } from "../types/showcase-feature";
import { ShowcaseExample } from "./showcase-example";

export type ShowcaseGroupProps = {
	readonly group: ShowcaseGroupContent;
};

/**
 * Renders one major showcase group with its examples.
 *
 * @param props Major feature group content.
 * @returns A complete showcase group section.
 */
export function ShowcaseGroup(props: ShowcaseGroupProps) {
	return (
		<section
			className="showcase-group scroll-mt-32 border border-neutral-200/70 bg-white/70 p-[clamp(1rem,3vw,2rem)] shadow-[0_24px_80px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/5"
			id={props.group.id}
			data-showcase-major={props.group.id}
		>
			<div className="showcase-group-heading grid max-w-3xl gap-4 pb-8">
				<p className="eyebrow m-0 font-mono text-xs font-semibold uppercase leading-tight tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
					{props.group.eyebrow}
				</p>
				<h2 className="m-0 max-w-2xl text-[clamp(2rem,3.3vw,3.25rem)] font-semibold leading-tight tracking-[-0.045em] text-neutral-950 text-balance dark:text-neutral-100">
					{props.group.title}
				</h2>
				<p className="m-0 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
					{props.group.body}
				</p>
			</div>
			<div className="showcase-examples grid gap-6">
				{props.group.examples.map((example) => (
					<ShowcaseExample example={example} key={example.id} />
				))}
			</div>
		</section>
	);
}
