export type TwitterPostType = "post" | "reply" | "repost" | "unknown";

/** Parsed Twitter/X timeline item ready for SQLite persistence. */
export type TwitterPostRecord = {
	source: string;
	account: string;
	statusId: string;
	type: TwitterPostType;
	author?: string;
	postedAt?: string;
	url?: string;
	content: string;
	rawTitle: string;
	rawDescription?: string;
	fetchedAt: string;
};
