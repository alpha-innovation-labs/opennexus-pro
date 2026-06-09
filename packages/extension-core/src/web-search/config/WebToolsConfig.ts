/**
 * Configuration shape for the web-tools extension.
 *
 * Mirrors the JSON structure stored in `~/.config/nexus/config.json`.
 */

/**
 * SearXNG backend configuration.
 */
export type SearXNGConfig = {
  /** Whether this backend is enabled. */
  enabled: boolean;
  /** Base URL of the SearXNG instance. */
  url: string;
  /** Optional Bearer token for authenticated SearXNG. */
  apiKey: string;
};

/**
 * Crawl4AI backend configuration.
 */
export type Crawl4AIConfig = {
  /** Whether this backend is enabled. */
  enabled: boolean;
  /** Base URL of the Crawl4AI server. */
  url: string;
  /** Optional JWT token for authenticated Crawl4AI. */
  token: string;
};

/**
 * Jina Reader backend configuration.
 */
export type JinaConfig = {
  /** Whether this backend is enabled. */
  enabled: boolean;
  /** API key for Jina Reader. */
  apiKey: string;
};

/**
 * Merged web-tools configuration loaded from file + env vars.
 */
export type WebToolsConfig = {
  searxng: SearXNGConfig;
  crawl4ai: Crawl4AIConfig;
  jina: JinaConfig;
};

/**
 * Default configuration values used when no config file exists.
 */
export const DEFAULT_WEB_TOOLS_CONFIG: WebToolsConfig = {
  searxng: {
    enabled: true,
    /** Tailscale IP of the SearXNG server (not the public server IP). */
    url: "http://100.106.251.92:8090",
    apiKey: "",
  },
  crawl4ai: {
    enabled: true,
    /** Tailscale IP of the Crawl4AI server (same host as SearXNG). */
    url: "http://100.106.251.92:11235",
    token: "",
  },
  jina: {
    enabled: true,
    apiKey: "",
  },
};
