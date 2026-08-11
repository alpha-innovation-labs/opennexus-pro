import Link from "next/link";

/**
 * Renders the compact landing page footer.
 *
 * @returns The site footer.
 */
export function Footer() {
	return (
		<footer className="site-footer mx-auto mb-6 flex max-w-[1168px] justify-between gap-4 px-5 py-4 text-sm text-neutral-500 dark:text-neutral-400 max-[560px]:flex-col">
			<p className="m-0">Nexus is built for focused agentic engineering.</p>
			<Link
				className="font-medium text-neutral-950 dark:text-neutral-100"
				href="#top"
			>
				Back to top
			</Link>
		</footer>
	);
}
