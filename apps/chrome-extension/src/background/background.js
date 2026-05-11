import { togglePicker } from "./launcher-actions.js";
import { connectNative } from "./native-port.js";
import { routeRuntimeMessage } from "./message-router.js";

chrome.runtime.onMessage.addListener(routeRuntimeMessage);

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-picker") togglePicker();
});

connectNative();
console.log("[pi-annotate] Background script loaded");
