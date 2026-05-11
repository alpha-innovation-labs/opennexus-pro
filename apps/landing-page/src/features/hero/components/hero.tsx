import { InstallBox } from "./install-box";

/**
 * Renders the landing hero intro and install command.
 *
 * @returns The hero section.
 */
export function Hero() {
  return (
    <section className="hero-section relative grid bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.96),rgb(250,250,250)_58%)] text-center dark:bg-[radial-gradient(circle_at_50%_0%,rgba(20,20,20,0.96),#000_58%)]" id="top">
      <div className="hero-visual mx-auto grid w-full max-w-6xl place-items-center content-start gap-4 px-8 pb-2 pt-[clamp(1.8rem,4vw,3rem)] max-[860px]:px-5 max-[860px]:pt-8">
        <h1 className="m-0 max-w-none whitespace-nowrap text-center text-[clamp(3rem,4vw,4.45rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-neutral-950 dark:text-neutral-100 max-[860px]:whitespace-normal max-[560px]:text-[2.65rem]">
          For the love of TUIs
        </h1>
        <InstallBox />
      </div>
    </section>
  );
}
