import type { LandingFeature } from "../types/landing-feature.js";

/**
 * Renders one marketing feature card.
 *
 * @param feature Feature content to display.
 * @returns Static HTML for one feature card.
 */
export function renderFeatureCard(feature: LandingFeature): string {
  return `
    <article class="feature-card">
      <p>${feature.eyebrow}</p>
      <h3>${feature.title}</h3>
      <span>${feature.body}</span>
    </article>
  `;
}
