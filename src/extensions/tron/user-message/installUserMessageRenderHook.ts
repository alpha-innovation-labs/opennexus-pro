import { setUserMessageRenderHook } from "/opt/homebrew/lib/node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/user-message.js";
import { OSC133_ZONE_END, OSC133_ZONE_FINAL, OSC133_ZONE_START } from "./constants.ts";
import { getRawText } from "./getRawText.ts";
import { renderCompactInputBubble } from "./renderCompactInputBubble.ts";

/**
 * Installs the custom user-message renderer.
 */
export function installUserMessageRenderHook(): void {
	setUserMessageRenderHook((component: any, width: number): string[] => {
		const text = typeof component?.text === "string" ? component.text : getRawText(component);
		const lines = renderCompactInputBubble(text, width);
		if (lines.length === 0) return lines;
		lines[0] = OSC133_ZONE_START + lines[0];
		lines[lines.length - 1] = lines[lines.length - 1] + OSC133_ZONE_END + OSC133_ZONE_FINAL;
		return lines;
	});
}
