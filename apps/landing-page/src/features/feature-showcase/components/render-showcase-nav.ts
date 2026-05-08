import type { ShowcaseGroup } from "../types/showcase-feature.js";

/**
 * Renders the sticky two-layer feature navigation.
 *
 * @param groups Major feature groups and their child examples.
 * @returns Static HTML for the sticky showcase navigation.
 */
export function renderShowcaseNav(groups: readonly ShowcaseGroup[]): string {
  const majorItems = groups
    .map((group) => `<a href="#${group.id}" data-showcase-major-link="${group.id}">${group.label}</a>`)
    .join("");
  const childItems = groups
    .flatMap((group) => group.examples.map((example) => ({ groupId: group.id, example })))
    .map(({ groupId, example }) => `<a href="#${example.id}" data-showcase-child-link="${example.id}" data-showcase-parent="${groupId}">${example.eyebrow}</a>`)
    .join("");
  const savingsItem = `<a href="#core-plugin-savings" data-showcase-child-link="core-plugin-savings" data-showcase-parent="core-plugins">Core savings</a>`;

  return `
    <nav class="feature-sticky-nav" aria-label="Feature showcase navigation">
      <div class="feature-major-nav">${majorItems}</div>
      <div class="feature-child-nav">${childItems}${savingsItem}</div>
    </nav>
  `;
}
