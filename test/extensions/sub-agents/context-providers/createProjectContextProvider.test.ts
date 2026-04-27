import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { createProjectContextProvider } from "../../../../packages/extensions/src/sub-agents/context-providers/createProjectContextProvider.js";

test("createProjectContextProvider includes cwd and project files", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "nexus-project-context-"));
  await mkdir(join(cwd, "src"));
  await writeFile(join(cwd, "package.json"), JSON.stringify({ name: "demo-app" }, null, 2));
  await writeFile(join(cwd, "README.md"), "# Demo\n\nHello");

  const provider = createProjectContextProvider();
  const text = await provider.provide({ ctx: { cwd } as never });

  assert.match(text, /# Project Context/);
  assert.match(text, /cwd:/);
  assert.match(text, /dir: src/);
  assert.match(text, /demo-app/);
  assert.match(text, /# Demo/);
});
