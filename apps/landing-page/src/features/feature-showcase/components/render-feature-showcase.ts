import { showcaseGroups } from "../data/showcase-groups.js";
import { renderSavingsSection } from "./render-savings-section.js";
import { renderShowcaseGroup } from "./render-showcase-group.js";
import { renderShowcaseNav } from "./render-showcase-nav.js";
import { renderWorkflowStrip } from "./render-workflow-strip.js";

/**
 * Renders the full feature showcase below the hero.
 *
 * @returns Static HTML for major feature groups, sticky nav, and savings close.
 */
export function renderFeatureShowcase(): string {
  return `
    <section class="feature-showcase" id="features">
      <div class="section-heading showcase-intro">
        <p class="eyebrow">Major features</p>
        <h2>Three plugin layers, one calmer agent cockpit.</h2>
      </div>
      ${renderWorkflowStrip()}
      ${renderShowcaseNav(showcaseGroups)}
      ${showcaseGroups.map(renderShowcaseGroup).join("")}
      ${renderSavingsSection()}
    </section>
  `;
}
