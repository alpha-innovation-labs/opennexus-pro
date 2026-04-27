import { createGatewayUsageText } from "./createGatewayUsageText.js";

/**
 * Prints the supported gateway command usage.
 */
export function printGatewayUsage(): void {
	console.log(createGatewayUsageText());
}
