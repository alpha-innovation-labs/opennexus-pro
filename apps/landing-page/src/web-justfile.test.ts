import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const projectRoot = resolve(import.meta.dirname, "../../..");
const justfile = await readFile(resolve(projectRoot, "justfile"), "utf8");
const webRecipe = await readFile(resolve(projectRoot, "justfiles/development/web.just"), "utf8");

assert.match(justfile, /just \\033\[0;33mweb\\033\[0m/);
assert.match(justfile, /import 'justfiles\/development\/web.just'/);
assert.match(webRecipe, /web PORT="4321":/);
assert.match(webRecipe, /npm --workspace landing-page run dev/);
assert.match(webRecipe, /open "\$\{URL\}"/);
assert.match(webRecipe, /curl -fsS "\$\{URL\}"/);
