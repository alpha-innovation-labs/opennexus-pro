import Link from "next/link";
import { Logo } from "../../../components/logo/logo";
import { ThemeToggle } from "./theme-toggle";

/**
 * Renders the sticky primary navigation for the landing page.
 *
 * @returns The Nexus navigation bar.
 */
export function Navbar() {
	return (
		<nav
			className="site-nav sticky top-0 z-50 border-b border-neutral-200/70 bg-white/92 backdrop-blur-lg dark:border-white/10 dark:bg-neutral-950/92"
			aria-label="Primary navigation"
		>
			<div className="nav-inner mx-auto flex h-16 max-w-[1728px] items-center justify-between px-[36px] max-[860px]:px-8 max-[560px]:px-4">
				<Logo />
				<div className="nav-links flex items-center gap-1 text-sm font-medium text-neutral-950 dark:text-neutral-100">
					<Link
						className="flex min-h-10 items-center px-4 hover:bg-neutral-100 dark:hover:bg-white/10 max-[860px]:hidden"
						href="#features"
					>
						Demo
					</Link>
					<Link
						className="flex min-h-10 items-center px-4 hover:bg-neutral-100 dark:hover:bg-white/10 max-[860px]:hidden"
						href="#features"
					>
						Features
					</Link>
					<ThemeToggle />
					<a
						className="nav-cta flex min-h-10 items-center bg-neutral-950/8 px-4 text-neutral-950 hover:bg-neutral-950 hover:text-white dark:bg-white/10 dark:text-neutral-100 dark:hover:bg-white dark:hover:text-black max-[560px]:px-3"
						href="https://opennexus.xyz/"
					>
						Open Nexus
					</a>
				</div>
			</div>
		</nav>
	);
}
