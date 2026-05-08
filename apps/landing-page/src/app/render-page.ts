import { renderFeatureShowcase } from "../features/feature-showcase/components/render-feature-showcase.js";
import { renderFooter } from "../features/footer/components/render-footer.js";
import { renderHero } from "../features/hero/components/render-hero.js";
import { renderNavbar } from "../features/navigation/components/render-navbar.js";

/**
 * Renders the complete Nexus landing page HTML document.
 *
 * @returns Full static HTML document.
 */
export function renderPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nexus | Love your TUI again</title>
    <meta name="description" content="A Nexus landing page for compact, terminal-native agentic engineering workflows." />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/styles/main.css" />
  </head>
  <body>
    ${renderNavbar()}
    <main>
      ${renderHero()}
      ${renderFeatureShowcase()}
    </main>
    ${renderFooter()}
    <script src="/scripts/theme-toggle.js" defer></script>
    <script src="/scripts/feature-nav.js" defer></script>
  </body>
</html>`;
}
