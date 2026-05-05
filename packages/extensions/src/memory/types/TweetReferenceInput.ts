/** Parameters required to store a tweet memory reference and topic entry. */
export type TweetReferenceInput = {
	projectName: string;
	projectDescription?: string;
	topicName: string;
	tweetUrl: string;
	title: string;
	rawMarkdown: string;
	distilledMarkdown: string;
	keywords?: string[];
	updated: string;
};
