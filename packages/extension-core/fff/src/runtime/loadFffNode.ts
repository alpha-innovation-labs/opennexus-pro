/**
 * Loads the FFF runtime module.
 *
 * @returns The loaded FFF module.
 */
export async function loadFffNode(): Promise<
	typeof import("@ff-labs/fff-node")
> {
	return await import("@ff-labs/fff-node");
}
