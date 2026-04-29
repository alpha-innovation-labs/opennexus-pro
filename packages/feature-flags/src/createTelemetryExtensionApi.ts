import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { sendTelemetryEventSafely } from "@nexus/observability/telemetry/sendTelemetryEventSafely.js";

/**
 * Creates an extension API wrapper that records anonymous command and extension usage.
 *
 * @param pi Original extension API.
 * @param extensionId Extension identifier.
 * @returns Wrapped extension API.
 */
export function createTelemetryExtensionApi(pi: ExtensionAPI, extensionId: string): ExtensionAPI {
  return new Proxy(pi, {
    get(target, property, receiver) {
      if (property !== "registerCommand") return Reflect.get(target, property, receiver);
      return (name: string, definition: Record<string, unknown>) => {
        const handler = typeof definition.handler === "function" ? definition.handler : undefined;
        const wrappedDefinition = handler
          ? { ...definition, handler: createTelemetryCommandHandler(extensionId, name, handler) }
          : definition;
        return target.registerCommand(name as never, wrappedDefinition as never);
      };
    },
  }) as ExtensionAPI;
}

/**
 * Wraps a command handler with usage telemetry.
 *
 * @param extensionId Extension identifier.
 * @param commandName Slash command name.
 * @param handler Original command handler.
 * @returns Wrapped command handler.
 */
function createTelemetryCommandHandler(extensionId: string, commandName: string, handler: (...args: unknown[]) => unknown) {
  return async (...args: unknown[]) => {
    await sendTelemetryEventSafely("command.used", {
      "command.name": commandName,
      "command.source": "extension",
    });
    await sendTelemetryEventSafely("extension.used", {
      "extension.id": extensionId,
      "extension.feature": `command:${commandName}`,
    });
    return handler(...args);
  };
}
