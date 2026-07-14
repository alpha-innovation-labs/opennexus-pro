import assert from "node:assert/strict";
import test from "node:test";
import { getProjectConfigDirPath } from "../../../packages/nexus-runtime/src/config/getProjectConfigDirPath.js";
import { getProjectSettingsPath } from "../../../packages/nexus-runtime/src/config/getProjectSettingsPath.js";
import { getProjectThemesPath } from "../../../packages/nexus-runtime/src/config/getProjectThemesPath.js";

test("Nexus project config paths resolve under .nexus", () => {
  assert.equal(getProjectConfigDirPath("/tmp/project"), "/tmp/project/.nexus");
  assert.equal(getProjectSettingsPath("/tmp/project"), "/tmp/project/.nexus/settings.json");
  assert.equal(getProjectThemesPath("/tmp/project"), "/tmp/project/.nexus/themes");
});
