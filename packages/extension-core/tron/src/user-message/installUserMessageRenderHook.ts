import { setUserMessageRenderHook } from "@nexus/pi-platform/userMessageHook";
import { renderCachedUserMessage } from "./renderCachedUserMessage";

/**
 * Installs the custom user-message renderer.
 */
export function installUserMessageRenderHook(): void {
  setUserMessageRenderHook((component: any, width: number): string[] => renderCachedUserMessage(component, width));
}
