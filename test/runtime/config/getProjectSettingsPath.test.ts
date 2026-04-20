import assert from "node:assert/strict";
import test from "node:test";
import { getProjectConfigDirPath } from "../../../src/runtime/config/getProjectConfigDirPath.js";
import { getProjectSettingsPath } from "../../../src/runtime/config/getProjectSettingsPath.js";
import { getProjectThemesPath } from "../../../src/runtime/config/getProjectThemesPath.js";

test("Nexus project config paths resolve under .nexus", () => {
  assert.equal(getProjectConfigDirPath("/tmp/project"), "/tmp/project/.nexus");
  assert.equal(getProjectSettingsPath("/tmp/project"), "/tmp/project/.nexus/settings.json");
  assert.equal(getProjectThemesPath("/tmp/project"), "/tmp/project/.nexus/themes");
});
