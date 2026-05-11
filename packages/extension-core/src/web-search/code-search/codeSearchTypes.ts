export type GitHubRepositorySearchItem = {
  full_name?: string;
  html_url?: string;
  description?: string | null;
  language?: string | null;
  stargazers_count?: number;
};

export type GitHubRepositorySearchResponse = {
  items?: GitHubRepositorySearchItem[];
};
