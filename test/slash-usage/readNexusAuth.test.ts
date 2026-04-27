import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { readNexusAuth } from "../../packages/extensions/src/usage-meter/shared/readNexusAuth.js";

const originalNexusDir = process.env.NEXUS_CODING_AGENT_DIR;
const originalPiDir = process.env.PI_CODING_AGENT_DIR;
const originalHome = process.env.HOME;

test.afterEach(() => {
  if (originalNexusDir === undefined) delete process.env.NEXUS_CODING_AGENT_DIR;
  else process.env.NEXUS_CODING_AGENT_DIR = originalNexusDir;
  if (originalPiDir === undefined) delete process.env.PI_CODING_AGENT_DIR;
  else process.env.PI_CODING_AGENT_DIR = originalPiDir;
  if (originalHome === undefined) delete process.env.HOME;
  else process.env.HOME = originalHome;
});

test("readNexusAuth reads auth from the Nexus agent directory", () => {
  const dir = join(tmpdir(), `nexus-auth-${process.pid}-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "auth.json"), JSON.stringify({ "openai-codex": { access: "nexus-token" } }));
  process.env.NEXUS_CODING_AGENT_DIR = dir;
  process.env.PI_CODING_AGENT_DIR = join(dir, "ignored-pi");

  assert.deepEqual(readNexusAuth(), { "openai-codex": { access: "nexus-token" } });
  rmSync(dir, { recursive: true, force: true });
});

test("readNexusAuth ignores PI_CODING_AGENT_DIR when Nexus dir is unset", () => {
  const dir = join(tmpdir(), `pi-auth-${process.pid}-${Date.now()}`);
  const home = join(tmpdir(), `nexus-home-${process.pid}-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  mkdirSync(home, { recursive: true });
  writeFileSync(join(dir, "auth.json"), JSON.stringify({ "openai-codex": { access: "pi-token" } }));
  delete process.env.NEXUS_CODING_AGENT_DIR;
  process.env.PI_CODING_AGENT_DIR = dir;
  process.env.HOME = home;

  assert.equal(readNexusAuth(), undefined);
  rmSync(dir, { recursive: true, force: true });
  rmSync(home, { recursive: true, force: true });
});
