export type ShowcaseExample = {
	readonly id: string;
	readonly eyebrow: string;
	readonly title: string;
	readonly body: string;
	readonly bullets: readonly string[];
};

export type ShowcaseGroup = {
	readonly id: string;
	readonly label: string;
	readonly eyebrow: string;
	readonly title: string;
	readonly body: string;
	readonly examples: readonly ShowcaseExample[];
};
