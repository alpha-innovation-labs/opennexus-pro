import { measureTronRender } from "../profiling/measureTronRender.js";
import { recordTronCacheEvent } from "../profiling/recordTronCacheEvent.js";
import { OSC133_ZONE_END, OSC133_ZONE_FINAL, OSC133_ZONE_START } from "./constants.ts";
import { getRawText } from "./getRawText.ts";
import { renderCompactInputBubble } from "./renderCompactInputBubble.ts";

type UserMessageRenderCache = {
  cachedText?: string;
  cachedWidth?: number;
  cachedLines?: string[];
};

type CachedUserMessageComponent = {
  text?: string;
  __nexusTronUserMessageRenderCache__?: UserMessageRenderCache;
};

/**
 * Returns the Pi-style render cache attached to a user-message component.
 *
 * @param component User-message component.
 * @returns Per-component render cache.
 */
function getComponentRenderCache(component: CachedUserMessageComponent): UserMessageRenderCache {
  component.__nexusTronUserMessageRenderCache__ ??= {};
  return component.__nexusTronUserMessageRenderCache__;
}

/**
 * Renders and caches Tron user-message bubble lines by text and width.
 *
 * @param component User-message component.
 * @param width Available render width.
 * @returns Rendered message lines.
 */
export function renderCachedUserMessage(component: CachedUserMessageComponent, width: number): string[] {
  const text = typeof component?.text === "string" ? component.text : getRawText(component);
  const cache = getComponentRenderCache(component);
  const cacheHit = Boolean(cache.cachedLines && cache.cachedText === text && cache.cachedWidth === width);
  recordTronCacheEvent("user-message", cacheHit, { width, textLength: text.length });
  if (cacheHit) return cache.cachedLines!;

  const lines = measureTronRender("user-message", () => {
    const renderedLines = renderCompactInputBubble(text, width);
    if (renderedLines.length > 0) {
      renderedLines[0] = OSC133_ZONE_START + renderedLines[0];
      renderedLines[renderedLines.length - 1] = renderedLines[renderedLines.length - 1] + OSC133_ZONE_END + OSC133_ZONE_FINAL;
    }
    return renderedLines;
  }, { width, textLength: text.length });

  cache.cachedText = text;
  cache.cachedWidth = width;
  cache.cachedLines = lines;
  return lines;
}
