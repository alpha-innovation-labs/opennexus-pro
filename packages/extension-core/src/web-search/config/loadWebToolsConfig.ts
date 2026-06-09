import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { WebToolsConfig } from "./WebToolsConfig.js";
import { DEFAULT_WEB_TOOLS_CONFIG } from "./WebToolsConfig.js";

const USER_CONFIG_DIR_ENV_NAME = "NEXUS_CONFIG_DIR";
const CONFIG_FILE_NAME = "config.json";

/**
 * Resolves the Nexus user config directory.
 * Respects the `NEXUS_CONFIG_DIR` environment variable.
 *
 * @returns Absolute path to the user config directory.
 */
function getUserConfigDirPath(): string {
  const configuredPath = process.env[USER_CONFIG_DIR_ENV_NAME];
  if (configuredPath) {
    if (configuredPath === "~") {
      return homedir();
    }
    if (configuredPath.startsWith("~/")) {
      return `${homedir()}${configuredPath.slice(1)}`;
    }
    return configuredPath;
  }

  return join(homedir(), ".config", "nexus");
}

/**
 * Reads and parses the web-tools config JSON file.
 * Returns `null` if the file does not exist or is invalid JSON.
 *
 * @returns Parsed config object, or `null` if not found.
 */
function readConfigFile(): unknown {
  const configDir = getUserConfigDirPath();
  const configPath = join(configDir, CONFIG_FILE_NAME);

  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const raw = readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/**
 * Checks whether a value looks like a valid config sub-section.
 */
function isConfigSection(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Extracts a string property from a raw section, returning `undefined` if missing.
 */
function getString(raw: Record<string, unknown>, key: string): string | undefined {
  const value = raw[key];
  if (typeof value === "string") return value;
  return undefined;
}

/**
 * Extracts a boolean property from a raw section, returning `undefined` if missing.
 */
function getBoolean(raw: Record<string, unknown>, key: string): boolean | undefined {
  const value = raw[key];
  if (typeof value === "boolean") return value;
  return undefined;
}

/**
 * Warns when a section is missing from the user's config file.
 * This makes it easy to spot mis-configurations without crashing.
 */
function warnMissingSection(section: string): void {
  console.warn(
    `[webtools] Config file is missing the "${section}" section. ` +
      `Add it to ~/.config/nexus/config.json or set the relevant environment variable. ` +
      `Falling back to defaults for this section.`,
  );
}

/**
 * Builds a complete SearXNG config from raw file data plus defaults.
 */
function buildSearxngConfig(raw: unknown): WebToolsConfig["searxng"] {
  const defaults = DEFAULT_WEB_TOOLS_CONFIG.searxng;

  if (!isConfigSection(raw)) {
    warnMissingSection("searxng");
    return { ...defaults };
  }

  return {
    enabled: getBoolean(raw, "enabled") ?? defaults.enabled,
    url: getString(raw, "url") ?? defaults.url,
    apiKey: getString(raw, "apiKey") ?? defaults.apiKey,
  };
}

/**
 * Builds a complete Crawl4AI config from raw file data plus defaults.
 */
function buildCrawl4aiConfig(raw: unknown): WebToolsConfig["crawl4ai"] {
  const defaults = DEFAULT_WEB_TOOLS_CONFIG.crawl4ai;

  if (!isConfigSection(raw)) {
    warnMissingSection("crawl4ai");
    return { ...defaults };
  }

  return {
    enabled: getBoolean(raw, "enabled") ?? defaults.enabled,
    url: getString(raw, "url") ?? defaults.url,
    token: getString(raw, "token") ?? defaults.token,
  };
}

/**
 * Builds a complete Jina config from raw file data plus defaults.
 *
 * Jina Reader works without an API key (free tier), so a missing section
 * is silently ignored rather than warned about.
 */
function buildJinaConfig(raw: unknown): WebToolsConfig["jina"] {
  const defaults = DEFAULT_WEB_TOOLS_CONFIG.jina;

  if (!isConfigSection(raw)) {
    return { ...defaults };
  }

  return {
    enabled: getBoolean(raw, "enabled") ?? defaults.enabled,
    apiKey: getString(raw, "apiKey") ?? defaults.apiKey,
  };
}

/**
 * Merges a raw config object with environment variable overrides.
 * Environment variables take precedence over file values.
 *
 * @param fileConfig Raw config from file (may be `null`).
 * @returns Merged configuration.
 */
function mergeWithEnvVars(fileConfig: WebToolsConfig): WebToolsConfig {
  const merged = { ...fileConfig };

  // SearXNG env overrides (highest precedence)
  const searxngUrl = process.env.SEARXNG_URL;
  if (searxngUrl) {
    merged.searxng.url = searxngUrl;
  }
  const searxngKey = process.env.SEARXNG_API_KEY;
  if (searxngKey) {
    merged.searxng.apiKey = searxngKey;
  }

  // Crawl4AI env overrides
  const crawl4aiUrl = process.env.CRAWL4AI_URL;
  if (crawl4aiUrl) {
    merged.crawl4ai.url = crawl4aiUrl;
  }
  const crawl4aiToken = process.env.CRAWL4AI_TOKEN;
  if (crawl4aiToken) {
    merged.crawl4ai.token = crawl4aiToken;
  }

  // Jina env override
  const jinaKey = process.env.JINA_API_KEY;
  if (jinaKey) {
    merged.jina.apiKey = jinaKey;
  }

  return merged;
}

/**
 * Loads the web-tools configuration from file and environment variables.
 *
 * Resolution order (highest to lowest precedence):
 * 1. Environment variables (`SEARXNG_URL`, `SEARXNG_API_KEY`, etc.)
 * 2. Config file at `~/.config/nexus/config.json` (or `$NEXUS_CONFIG_DIR/config.json`)
 * 3. Hardcoded defaults (see WebToolsConfig.ts — SearXNG defaults to the Tailscale IP `100.106.251.92:8090`)
 *
 * @returns Merged web-tools configuration.
 */
export function loadWebToolsConfig(): WebToolsConfig {
  const raw = readConfigFile();

  let rawSections: Record<string, unknown> = {};
  if (isConfigSection(raw)) {
    rawSections = raw;
  } else if (raw !== null) {
    console.warn(
      "[webtools] Config file exists but is not a JSON object. " +
        "Falling back to defaults for all sections.",
    );
  }

  const config: WebToolsConfig = {
    searxng: buildSearxngConfig(rawSections.searxng),
    crawl4ai: buildCrawl4aiConfig(rawSections.crawl4ai),
    jina: buildJinaConfig(rawSections.jina),
  };

  return mergeWithEnvVars(config);
}
