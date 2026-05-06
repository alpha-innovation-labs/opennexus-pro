/** One memory query match returned to the LLM. */
export type MemoryQueryResult = {
	project: string;
	topic: string;
	line: string;
	referenceName?: string;
	referencePath?: string;
};
