import { landingFeatures } from "../data/landing-features.js";
import { renderFeatureCard } from "./render-feature-card.js";

/**
 * Renders the feature section derived from the migrated Nexus marketing feature notes.
 *
 * @returns Static HTML for all landing page feature cards.
 */
export function renderFeaturesSection(): string {
  return `
    <section class="features-section" id="features">
      <div class="section-heading">
        <p class="eyebrow">Major features</p>
        <h2>Everything around the agent loop gets sharper.</h2>
      </div>
      <div class="features-grid">
        ${landingFeatures.map(renderFeatureCard).join("")}
      </div>
    </section>
  `;
}
