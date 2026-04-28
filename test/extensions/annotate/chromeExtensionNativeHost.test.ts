import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import test from "node:test";

const projectRoot = process.cwd();
const extensionRoot = path.join(projectRoot, "apps/chrome-extension");

test("chrome extension uses the Nexus native messaging host", () => {
  const backgroundSource = fs.readFileSync(path.join(extensionRoot, "background.js"), "utf8");
  const popupSource = fs.readFileSync(path.join(extensionRoot, "popup.js"), "utf8");
  const installSource = fs.readFileSync(path.join(extensionRoot, "native/install.sh"), "utf8");
  const manifestSource = fs.readFileSync(path.join(extensionRoot, "manifest.json"), "utf8");

  assert.match(manifestSource, /"name": "Nexus Annotate"/);
  assert.match(backgroundSource, /connectNative\("com\.nexus\.annotate"\)/);
  assert.doesNotMatch(backgroundSource, /com\.pi\.annotate/);
  assert.doesNotMatch(popupSource, /com\.pi\.annotate/);
  assert.match(installSource, /com\.nexus\.annotate\.json/);
  assert.match(installSource, /"name": "com\.nexus\.annotate"/);
});

test("popup health checks use daemon status and reflect launcher state", () => {
  const backgroundSource = fs.readFileSync(path.join(extensionRoot, "background.js"), "utf8");
  const popupSource = fs.readFileSync(path.join(extensionRoot, "popup.js"), "utf8");
  const popupHtml = fs.readFileSync(path.join(extensionRoot, "popup.html"), "utf8");

  assert.doesNotMatch(popupSource, /connectNative\(/);
  assert.match(popupSource, /CHECK_ANNOTATION_DAEMON/);
  assert.match(backgroundSource, /CHECK_ANNOTATION_DAEMON/);
  assert.match(backgroundSource, /Content script is stale, injecting current version/);
  assert.match(backgroundSource, /http:\/\/127\.0\.0\.1:47321\/health/);
  assert.match(popupHtml, /<span class="logo">N<\/span>/);
  assert.doesNotMatch(popupHtml, /Setup Guide/);
  assert.match(popupHtml, /id="quick-start-btn"/);
  assert.match(popupSource, /Show Annotation Bar/);
  assert.match(popupSource, /Hide Annotation Bar/);
  assert.match(popupSource, /GET_LAUNCHER_STATE/);
  assert.match(popupSource, /function startAnnotation\(\)/);
});

test("annotation comments commit on Enter without submitting the whole annotation", () => {
  const contentSource = fs.readFileSync(path.join(extensionRoot, "content.js"), "utf8");

  assert.match(contentSource, /textarea\.addEventListener\("keydown"/);
  assert.match(contentSource, /event\.key !== "Enter" \|\| event\.shiftKey \|\| event\.isComposing/);
  assert.match(contentSource, /event\.preventDefault\(\)/);
  assert.match(contentSource, /textarea\.blur\(\)/);
  assert.doesNotMatch(contentSource, /void handleSubmit\(\)/);
});

test("native host captures completed annotations through the daemon", () => {
  const hostSource = fs.readFileSync(path.join(extensionRoot, "native/host.cjs"), "utf8");

  assert.match(hostSource, /ANNOTATIONS_DAEMON_URL = "http:\/\/127\.0\.0\.1:47321\/annotations"/);
  assert.match(hostSource, /function storeCompletedAnnotation\(msg\)/);
  assert.match(hostSource, /msg\?\.type !== "ANNOTATIONS_COMPLETE"/);
  assert.match(hostSource, /fetch\(ANNOTATIONS_DAEMON_URL/);
});

test("annotation hide control does not send cancellation", () => {
  const contentSource = fs.readFileSync(path.join(extensionRoot, "content.js"), "utf8");

  assert.match(contentSource, /id=\"pi-cancel\">Hide/);
  assert.match(contentSource, /function hideActiveAnnotationPanel\(\)/);
  assert.match(contentSource, /pi-cancel"\)\.addEventListener\("click", hideActiveAnnotationPanel\)/);
  assert.match(contentSource, /pi-close"\)\.addEventListener\("click", hideActiveAnnotationPanel\)/);
});

test("content script captures compact locations and uses compact toolbar chrome", () => {
  const contentSource = fs.readFileSync(path.join(extensionRoot, "content.js"), "utf8");

  assert.match(contentSource, /location: generateElementLocation\(el\)/);
  assert.match(contentSource, /function generateElementLocation\(el\)/);
  assert.match(contentSource, /bottom: 1\.25rem;/);
  assert.match(contentSource, /right: 1\.25rem;/);
  assert.match(contentSource, /border-radius: 1\.5rem;/);
  assert.match(contentSource, /function isLocalhostPage\(\)/);
  assert.match(contentSource, /window\.location\.hostname\.includes\("localhost"\)/);
  assert.match(contentSource, /__nexusAnnotateLauncher_v2_/);
  assert.match(contentSource, /function showLauncher\(\)/);
  assert.match(contentSource, /launcherEl\.id = "pi-launcher"/);
  assert.match(contentSource, /pi-launcher-expanded/);
  assert.match(contentSource, /setLauncherExpanded\(!launcherEl\.classList\.contains\("pi-launcher-expanded"\)\)/);
  assert.match(contentSource, /pi-launcher-close"\)\?\.addEventListener\("click", \(\) => setLauncherExpanded\(false\)\)/);
  assert.match(contentSource, /toggleLauncher\(\)/);
  assert.match(contentSource, /showLauncher\(\);\n  console\.log\("\[pi-annotate\] Content script ready/);
  assert.match(contentSource, /Start annotation/);
  assert.match(contentSource, /Nexus Annotate/);
});
