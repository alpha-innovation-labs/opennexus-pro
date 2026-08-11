"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import type { ShowcaseGroup } from "../types/showcase-feature";
import { createShowcaseStoryMarkers } from "../utils/create-showcase-story-markers";
import { flattenShowcaseTerminalItems } from "../utils/flatten-showcase-terminal-items";
import { getActiveShowcaseTerminalItem } from "../utils/get-active-showcase-terminal-item";
import { getShowcaseStoryProgress } from "../utils/get-showcase-story-progress";
import { getShowcaseTerminalStickyTop } from "../utils/get-showcase-terminal-sticky-top";
import { resolveActiveShowcaseStoryId } from "../utils/resolve-active-showcase-story-id";
import { ShowcaseTerminalPlayer } from "./showcase-terminal-player";

export type ShowcaseStoryProps = {
	readonly groups: readonly ShowcaseGroup[];
};

/**
 * Renders a Pi-style scroll story where the sticky terminal changes with content sections.
 *
 * @param props Grouped showcase content.
 * @returns The scroll-synced terminal story.
 */
export function ShowcaseStory(props: ShowcaseStoryProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const terminalRef = useRef<HTMLElement>(null);
	const items = useMemo(
		() => flattenShowcaseTerminalItems(props.groups),
		[props.groups],
	);
	const [activeId, setActiveId] = useState(items[0]?.example.id ?? "");
	const activeItem = getActiveShowcaseTerminalItem(items, activeId);

	useEffect(() => {
		let frameId = 0;

		/** Synchronizes active section and terminal slide progress with scroll position. */
		function updateStoryState(): void {
			frameId = 0;
			const root = rootRef.current;
			if (!root || items.length === 0) return;

			const progress = getShowcaseStoryProgress(
				root.getBoundingClientRect(),
				window.innerHeight,
			);
			const sections = Array.from(
				root.querySelectorAll<HTMLElement>("[data-showcase-story-example]"),
			);
			const markers = createShowcaseStoryMarkers(sections);
			const nextActiveId = resolveActiveShowcaseStoryId(
				markers,
				window.innerHeight * 0.32,
				items[0].example.id,
			);
			const navHeight =
				document
					.querySelector<HTMLElement>(".site-nav")
					?.getBoundingClientRect().height ?? 0;
			const terminalHeight = terminalRef.current?.offsetHeight ?? 0;

			if (terminalHeight > 0) {
				root.style.setProperty(
					"--showcase-terminal-sticky-top",
					`${getShowcaseTerminalStickyTop(window.innerHeight, terminalHeight, navHeight)}px`,
				);
			}

			root.style.setProperty("--showcase-story-progress", progress.toFixed(4));
			setActiveId(nextActiveId);
		}

		/** Queues one animation-frame update for scroll and resize events. */
		function scheduleStoryStateUpdate(): void {
			if (frameId) return;
			frameId = window.requestAnimationFrame(updateStoryState);
		}

		updateStoryState();
		window.addEventListener("scroll", scheduleStoryStateUpdate, {
			passive: true,
		});
		window.addEventListener("resize", scheduleStoryStateUpdate, {
			passive: true,
		});

		return () => {
			if (frameId) window.cancelAnimationFrame(frameId);
			window.removeEventListener("scroll", scheduleStoryStateUpdate);
			window.removeEventListener("resize", scheduleStoryStateUpdate);
		};
	}, [items]);

	return (
		<div
			ref={rootRef}
			className="feature-story-grid mx-auto grid w-full max-w-[1728px] grid-cols-[minmax(0,1.4fr)_clamp(396px,calc(100%-var(--page-shell-gap)-var(--home-demo-column-floor)),648px)] gap-[var(--page-shell-gap)] px-[36px] py-12 [--home-demo-column-floor:720px] [--page-shell-gap:clamp(45px,4vw,90px)] [--showcase-story-progress:0] [--showcase-terminal-sticky-top:calc(50vh-12rem)] max-[1023px]:grid-cols-1 max-[1023px]:gap-0 max-[1023px]:px-8 max-[860px]:px-4 max-[860px]:py-8"
		>
			<div className="showcase-terminal-rail z-20 flex min-h-[calc(100vh-8rem)] items-start max-[860px]:min-h-0">
				<figure
					ref={terminalRef}
					className="showcase-terminal-figure sticky top-[var(--showcase-terminal-sticky-top)] w-full max-w-[56rem] overflow-hidden border border-neutral-300/80 bg-black shadow-[0_28px_80px_rgba(0,0,0,0.2)] transition-opacity duration-200 dark:border-white/20 max-[860px]:static"
					style={{
						transform:
							"translate3d(calc((1 - var(--showcase-story-progress)) * 16vw), 0, 0) scale(calc(1 + (1 - var(--showcase-story-progress)) * 0.08))",
						transformOrigin: "center center",
					}}
				>
					<figcaption className="showcase-terminal-caption flex items-center gap-2 border-b border-white/10 bg-neutral-950 px-4 py-3 font-mono text-[0.68rem] font-bold uppercase leading-none tracking-[0.18em] text-neutral-300">
						<span className="h-2.5 w-2.5 bg-[#ff5f57]" aria-hidden="true" />
						<span className="h-2.5 w-2.5 bg-[#ffbd2e]" aria-hidden="true" />
						<span className="h-2.5 w-2.5 bg-[#28c840]" aria-hidden="true" />
						<span className="ml-2 min-w-0 truncate">nexus / original cast</span>
						<span className="ml-auto h-2 w-2 bg-cyan-300" aria-hidden="true" />
					</figcaption>
					{activeItem ? (
						<ShowcaseTerminalPlayer
							key={activeItem.castSrc}
							castSrc={activeItem.castSrc}
							title={activeItem.example.title}
						/>
					) : null}
				</figure>
			</div>

			<div
				className="feature-story-copy grid gap-14 pt-[clamp(10rem,18vh,14rem)] transition-opacity duration-300 max-[860px]:pt-0"
				style={{ opacity: "var(--showcase-story-progress)" }}
			>
				{props.groups.map((group) => (
					<section
						className="showcase-group scroll-mt-32"
						id={group.id}
						data-showcase-major={group.id}
						key={group.id}
					>
						<div className="showcase-group-heading grid gap-4 pb-8">
							<p className="eyebrow m-0 font-mono text-xs font-semibold uppercase leading-tight tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
								{group.eyebrow}
							</p>
							<h2 className="m-0 max-w-2xl text-[clamp(2rem,3.3vw,3.25rem)] font-semibold leading-tight tracking-[-0.045em] text-neutral-950 text-balance dark:text-neutral-100">
								{group.title}
							</h2>
							<p className="m-0 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
								{group.body}
							</p>
						</div>
						<div className="grid gap-10">
							{group.examples.map((example) => {
								const isActive = example.id === activeId;
								return (
									<article
										className={cn(
											"showcase-example scroll-mt-32 border-l-2 py-4 pl-6 transition duration-200",
											isActive
												? "border-cyan-400 opacity-100"
												: "border-neutral-200 opacity-45 dark:border-white/10",
										)}
										id={example.id}
										data-showcase-child={example.id}
										data-showcase-story-example="true"
										key={example.id}
									>
										<p className="eyebrow m-0 pb-3 font-mono text-xs font-semibold uppercase leading-tight tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
											{example.eyebrow}
										</p>
										<h3
											className="m-0 text-[clamp(1.35rem,1.75vw,1.8rem)] font-semibold leading-tight tracking-[-0.035em] text-neutral-950 text-balance dark:text-neutral-100"
											data-showcase-story-title="true"
										>
											{example.title}
										</h3>
										<p className="m-0 pt-4 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
											{example.body}
										</p>
										<ul className="m-0 grid list-none gap-2 pt-4 p-0">
											{example.bullets.map((bullet) => (
												<li
													className="font-mono text-xs font-semibold leading-relaxed text-neutral-800 dark:text-neutral-200"
													key={bullet}
												>
													{bullet}
												</li>
											))}
										</ul>
									</article>
								);
							})}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}
