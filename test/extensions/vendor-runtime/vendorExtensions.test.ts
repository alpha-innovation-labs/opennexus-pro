import assert from "node:assert/strict";
import test from "node:test";
import { createExtensionFeatureFlags } from "../../../packages/feature-flags/src/createExtensionFeatureFlags.js";
import { getBundledFeatureFlagsConfig } from "../../../packages/feature-flags/src/getBundledFeatureFlagsConfig.js";
import { registerVendorWebsearchExtension } from "../../../packages/extensions/src/vendor-runtime/registerVendorWebsearchExtension.js";

/**
 * Creates a minimal extension API test double that records registered tools and commands.
 *
 * @returns Test API and captured registrations.
 */
function createRecordingExtensionApi() {
  const tools: string[] = [];
  const commands: string[] = [];
  const resourceHandlers: Array<() => { skillPaths?: string[] }> = [];
  const api = new Proxy({}, {
    get(_target, property) {
      if (property === "registerTool") return (tool: { name: string }) => tools.push(tool.name);
      if (property === "registerCommand") return (name: string) => commands.push(name);
      if (property === "on") {
        return (event: string, handler: () => { skillPaths?: string[] }) => {
          if (event === "resources_discover") resourceHandlers.push(handler);
        };
      }
      if (property === "events") return { on() {}, emit() {} };
      return () => undefined;
    },
  });
  return { api, tools, commands, resourceHandlers };
}

test("websearch is a native enabled Nexus feature flag", () => {
  const flag = createExtensionFeatureFlags().find((entry) => entry.id === "websearch");

  assert.equal(flag?.enabled, true);
  assert.equal(getBundledFeatureFlagsConfig().extensions.websearch?.category, "extension");
});

test("vendor websearch registers pi-web-access tools through the Nexus wrapper", async () => {
  const { api, tools, commands, resourceHandlers } = createRecordingExtensionApi();

  await registerVendorWebsearchExtension(api as never);

  assert.deepEqual(tools, ["web_search", "code_search", "fetch_content", "get_search_content"]);
  assert.deepEqual(commands, ["websearch", "curator", "google-account", "search"]);
  assert.match(resourceHandlers[0]?.().skillPaths?.[0] ?? "", /vendor\/websearch\/skills$/u);
});
