import { renderLogo } from "../../brand/components/render-logo.js";

/**
 * Renders the always-on-top landing page navigation bar.
 *
 * @returns Static HTML for the primary navigation.
 */
export function renderNavbar(): string {
  return `
    <nav class="site-nav" aria-label="Primary navigation">
      <div class="nav-inner">
        ${renderLogo()}
        <div class="nav-links">
          <a href="#demo">Demo</a>
          <a href="#features">Features</a>
          <a class="nav-cta" href="https://opennexus.xyz/">Open Nexus</a>
        </div>
      </div>
    </nav>
  `;
}
