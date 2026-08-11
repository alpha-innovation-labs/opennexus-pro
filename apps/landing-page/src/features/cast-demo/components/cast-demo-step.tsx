import type { CastDemoStep as CastDemoStepContent } from "../data/cast-demo-steps";

export type CastDemoStepProps = {
	readonly step: CastDemoStepContent;
	readonly index: number;
};

/**
 * Renders one explanatory copy panel beside the terminal recording.
 *
 * @param props Demo copy and position.
 * @returns A single cast demo copy panel.
 */
export function CastDemoStep(props: CastDemoStepProps) {
	const titleId =
		props.index === 0 ? "cast-demo-title" : `cast-demo-title-${props.index}`;

	return (
		<article
			className="cast-demo-copy flex max-w-[31rem] flex-col justify-start p-0 text-neutral-950 dark:text-neutral-100 max-[860px]:max-w-none"
			aria-labelledby={titleId}
		>
			<p className="eyebrow m-0 mb-4 font-mono text-xs font-bold uppercase leading-tight tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
				{props.step.eyebrow}
			</p>
			<h2
				className="m-0 max-w-[13ch] text-[clamp(2.1rem,3vw,3.35rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-neutral-950 text-balance dark:text-neutral-100 max-[860px]:text-[clamp(1.75rem,9vw,2.45rem)]"
				id={titleId}
			>
				{props.step.title}
			</h2>
			<p className="max-w-md text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
				{props.step.body}
			</p>
		</article>
	);
}
