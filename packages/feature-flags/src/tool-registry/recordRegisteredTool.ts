import { registeredToolRecords } from "./registeredToolRecords";

/**
 * Records an extension tool registration for Nexus UI grouping.
 *
 * @param extensionId Feature-flag extension id that registered the tool.
 * @param definition Tool definition passed to Pi.
 */
export function recordRegisteredTool(extensionId: string, definition: { name?: unknown; description?: unknown; parameters?: unknown }): void {
  if (typeof definition.name !== "string" || definition.name.length === 0) return;
  registeredToolRecords.set(definition.name, {
    name: definition.name,
    description: typeof definition.description === "string" ? definition.description : "No description",
    parameters: definition.parameters,
    extensionId,
  });
}
