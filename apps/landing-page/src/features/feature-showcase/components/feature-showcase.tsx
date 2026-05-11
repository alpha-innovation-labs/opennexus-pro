import { showcaseGroups } from "../data/showcase-groups";
import { ShowcaseGroup } from "./showcase-group";
import { ShowcaseNav } from "./showcase-nav";

/**
 * Renders the complete feature showcase and its sticky navigation.
 *
 * @returns The feature showcase section.
 */
export function FeatureShowcase() {
  return (
    <section className="feature-showcase mx-auto bg-neutral-50 pb-20 dark:bg-black" id="features">
      <ShowcaseNav groups={showcaseGroups} />
      <div className="grid gap-12 px-[clamp(1rem,4vw,3rem)] py-12 max-[860px]:gap-8 max-[860px]:px-4 max-[860px]:py-8">
        {showcaseGroups.map((group) => <ShowcaseGroup group={group} key={group.id} />)}
      </div>
    </section>
  );
}
