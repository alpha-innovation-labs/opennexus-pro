import { setBridgeFactoryForTests } from "pi-cursor-provider/proxy.js";
import { createCursorBridgeFactory } from "./createCursorBridgeFactory.js";
import { getCursorBridgePath } from "./getCursorBridgePath.js";

/**
 * Configures pi-cursor-provider to use a filesystem bridge script available in release builds.
 */
export function configureCursorBridgeFactory(): void {
	setBridgeFactoryForTests(createCursorBridgeFactory(getCursorBridgePath()) as never);
}
