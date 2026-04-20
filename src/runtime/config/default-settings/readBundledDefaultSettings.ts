import { readFileSync } from "node:fs";
import { getBundledDefaultSettingsPath } from "./getBundledDefaultSettingsPath.js";

export type NexusAppDefaults = Record<string, unknown>;

/**
 * Reads the shipped Nexus app defaults from the bundled defaults asset.
 *
 * @returns Parsed app-default settings.
 */
export function readBundledDefaultSettings(): NexusAppDefaults {
  return JSON.parse(readFileSync(getBundledDefaultSettingsPath(), "utf8")) as NexusAppDefaults;
}
