#!/usr/bin/env tsx
/**
 * create-session.ts — Create a zellij session with web_sharing config.
 */
import { sessionCreate } from "./zellij-manager/session.ts";
import * as fs from "node:fs";
import * as os from "node:os";

const tmpDir = fs.mkdtempSync(`/tmp/zellij-`);
const configPath = `${tmpDir}/config.kdl`;
fs.writeFileSync(configPath, `web_sharing "on"\nshow_startup_tips false\nshow_release_notes false\n`);

try {
  sessionCreate("e2e-test", { layout: "compact", config: configPath });
} finally {
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
}
