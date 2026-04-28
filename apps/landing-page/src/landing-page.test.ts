import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import { renderPage } from "./app/render-page.js";
import { landingFeatures } from "./features/features-section/data/landing-features.js";

const projectRoot = resolve(import.meta.dirname, "../../..");
const pageHtml = renderPage();

assert.match(pageHtml, /<nav class="site-nav"/);
assert.match(pageHtml, /class="brand-mark"/);
assert.match(pageHtml, /src="\/icon.svg"/);
assert.match(pageHtml, /Nexus/);
assert.match(pageHtml, /<section class="hero-section"/);
assert.match(pageHtml, /Love your TUI again/);
assert.doesNotMatch(pageHtml, /Agent-native engineering cockpit/);
assert.match(pageHtml, /<video[^>]+src="\/nexus-showcase.mp4"/);
assert.match(pageHtml, /<section class="features-section"/);
assert.equal(landingFeatures.length, 6);
assert.equal(existsSync(resolve(projectRoot, "apps/landing-page/content/features.md")), true);
assert.equal(existsSync(resolve(projectRoot, "marketing/website/features.md")), false);

const stylesheet = await readFile(resolve(projectRoot, "apps/landing-page/src/styles/main.css"), "utf8");
assert.match(stylesheet, /position: fixed;/);
assert.match(stylesheet, /@keyframes logo-orbit-pulse/);
assert.match(stylesheet, /@keyframes wordmark-scan/);
assert.match(stylesheet, /#d25a5a/);
