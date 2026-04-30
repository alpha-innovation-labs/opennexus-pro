/** Parameters required to create a tweet reference pair. */
export type TweetReferenceInput = {
	projectName: string;
	projectDescription?: string;
	kind: "app" | "package";
	appName?:
	packageGroup?: string;
	packageName?: string;
	featureName?: string;
	tweetUrl: string;
	title: string;
	rawMarkdown: string;
	distilledMarkdown: string;
	keywords?: string[];
	updated: string;
};
