import Image from "next/image";
import Link from "next/link";

/**
 * Renders the Nexus brand mark and wordmark used by primary navigation.
 *
 * @returns The accessible Nexus home link.
 */
export function Logo() {
	return (
		<Link
			className="brand-lockup inline-flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-white/10"
			href="#top"
			aria-label="Nexus home"
		>
			<span
				className="brand-mark grid h-8 w-8 place-items-center border-0 bg-transparent"
				aria-hidden="true"
			>
				<Image
					className="h-6 w-6 opacity-100"
					src="/icon.svg"
					alt=""
					width={24}
					height={24}
					priority
				/>
			</span>
			<span className="brand-name text-base font-semibold tracking-[-0.02em] text-neutral-950 dark:text-neutral-100 max-[560px]:text-sm">
				Nexus
			</span>
		</Link>
	);
}
