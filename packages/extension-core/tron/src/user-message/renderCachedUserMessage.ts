import { measureTronRender } from "../profiling/measureTronRender";
import { recordTronCacheEvent } from "../profiling/recordTronCacheEvent";
import {
	OSC133_ZONE_END,
	OSC133_ZONE_FINAL,
	OSC133_ZONE_START,
} from "./constants";
import { getRawText } from "./getRawText";
import { getUserMessageMetadataCacheKey } from "./metadata/getUserMessageMetadataCacheKey";
import { resolveUserMessageMetadata } from "./metadata/userMessageMetadataStore";
import { renderCompactInputBubble } from "./renderCompactInputBubble";

type UserMessageRenderCache = {
	cachedText?: string;
	cachedWidth?: number;
	cachedMetadataKey?: string;
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
function getComponentRenderCache(
	component: CachedUserMessageComponent,
): UserMessageRenderCache {
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
export function renderCachedUserMessage(
	component: CachedUserMessageComponent,
	width: number,
): string[] {
	const text =
		typeof component?.text === "string"
			? component.text
			: getRawText(component);
	const metadata = resolveUserMessageMetadata(component);
	const metadataKey = getUserMessageMetadataCacheKey(metadata);
	const cache = getComponentRenderCache(component);
	const cacheHit = Boolean(
		cache.cachedLines &&
			cache.cachedText === text &&
			cache.cachedWidth === width &&
			cache.cachedMetadataKey === metadataKey,
	);
	recordTronCacheEvent("user-message", cacheHit, {
		width,
		textLength: text.length,
	});
	if (cacheHit && cache.cachedLines) return cache.cachedLines;

	const lines = measureTronRender(
		"user-message",
		() => {
			const renderedLines = renderCompactInputBubble(text, width, metadata);
			if (renderedLines.length > 0) {
				renderedLines[0] = OSC133_ZONE_START + renderedLines[0];
				renderedLines[renderedLines.length - 1] =
					renderedLines[renderedLines.length - 1] +
					OSC133_ZONE_END +
					OSC133_ZONE_FINAL;
			}
			return renderedLines;
		},
		{ width, textLength: text.length },
	);

	cache.cachedText = text;
	cache.cachedWidth = width;
	cache.cachedMetadataKey = metadataKey;
	cache.cachedLines = lines;
	return lines;
}
