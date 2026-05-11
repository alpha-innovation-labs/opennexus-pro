import { FeatureShowcase } from "../features/feature-showcase/components/feature-showcase";
import { Footer } from "../features/footer/components/footer";
import { Hero } from "../features/hero/components/hero";
import { Navbar } from "../features/navigation/components/navbar";

/**
 * Composes the Nexus landing page from feature-owned React modules.
 *
 * @returns The rendered landing page route.
 */
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="relative mx-auto mb-8 max-w-[1728px] overflow-visible bg-neutral-50 before:pointer-events-none before:absolute before:bottom-[-2rem] before:right-full before:top-[-4rem] before:w-4 before:bg-[repeating-linear-gradient(135deg,transparent_0_5px,rgba(0,0,0,0.08)_5px_6px,transparent_6px_10px)] before:opacity-40 after:pointer-events-none after:absolute after:bottom-[-2rem] after:left-full after:top-[-4rem] after:w-4 after:bg-[repeating-linear-gradient(135deg,transparent_0_5px,rgba(0,0,0,0.08)_5px_6px,transparent_6px_10px)] after:opacity-40 dark:bg-black dark:before:bg-[repeating-linear-gradient(135deg,transparent_0_5px,rgba(255,255,255,0.08)_5px_6px,transparent_6px_10px)] dark:after:bg-[repeating-linear-gradient(135deg,transparent_0_5px,rgba(255,255,255,0.08)_5px_6px,transparent_6px_10px)] max-[860px]:before:hidden max-[860px]:after:hidden">
        <Hero />
        <FeatureShowcase />
      </main>
      <Footer />
    </>
  );
}
