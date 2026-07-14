import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createResourceCommandMarkdown } from "../../../packages/extension-core/src/slash-menu/createResourceCommandMarkdown.js";

/**
 * Creates a temporary markdown source file.
 *
 * @param content File content.
 * @returns Source file path.
 */
async function createSourceFile(content: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "nexus-resource-command-"));
  const filePath = join(dir, "COMMAND.md");
  await writeFile(filePath, content, "utf8");
  return filePath;
}

test("createResourceCommandMarkdown returns the full source markdown file", async () => {
  const content = "# Full Skill\n\nLong body that must not be replaced by the description.\n\n## Details\n\n- one\n- two";
  const sourcePath = await createSourceFile(content);

  const markdown = createResourceCommandMarkdown({
    kind: "command",
    label: "skill:full",
    description: "Short description only",
    sourcePath,
    value: "skill:full",
  });

  assert.equal(markdown, content);
  assert.doesNotMatch(markdown, /Short description only/u);
});
