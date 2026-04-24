import { setUserMessageRenderHook } from "../../../pi-internals/userMessageHook.js";
import { renderCachedUserMessage } from "./renderCachedUserMessage.js";

/**
 * Installs the custom user-message renderer.
 */
export function installUserMessageRenderHook(): void {
  setUserMessageRenderHook((component: any, width: number): string[] => renderCachedUserMessage(component, width));
}
