import { showcaseGroups } from "../data/showcase-groups";
import { ShowcaseNav } from "./showcase-nav";
import { ShowcaseStory } from "./showcase-story";

/**
 * Renders the complete feature showcase with Pi-style scroll-synced terminal storytelling.
 *
 * @returns The feature showcase section.
 */
export function FeatureShowcase() {
	return (
		<section
			className="feature-showcase mx-auto bg-neutral-50 pb-20 dark:bg-black"
			id="features"
		>
			<ShowcaseNav groups={showcaseGroups} />
			<ShowcaseStory groups={showcaseGroups} />
		</section>
	);
}
