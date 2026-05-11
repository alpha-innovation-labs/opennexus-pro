import { UserMessageComponent } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/user-message.js";

type UserMessageRenderHook = (component: UserMessageComponent, width: number) => string[];

const userMessagePrototype = UserMessageComponent.prototype as UserMessageComponent & {
  render(width: number): string[];
};
const originalRender = userMessagePrototype.render;
let currentUserMessageRenderHook: UserMessageRenderHook | undefined;
let userMessageHookInstalled = false;

/**
 * Installs the user-message hook bridge exactly once.
 */
function installUserMessageHookBridge(): void {
  if (userMessageHookInstalled) {
    return;
  }

  userMessagePrototype.render = function renderWithHook(width: number): string[] {
    if (currentUserMessageRenderHook) {
      return currentUserMessageRenderHook(this, width);
    }
    return originalRender.call(this, width);
  };
  userMessageHookInstalled = true;
}

/**
 * Sets the user-message render hook used by Tron.
 *
 * @param hook Hook callback, or undefined to restore default rendering.
 */
export function setUserMessageRenderHook(hook: UserMessageRenderHook | undefined): void {
  installUserMessageHookBridge();
  currentUserMessageRenderHook = hook;
}
