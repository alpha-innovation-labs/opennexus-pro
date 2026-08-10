export type GitHubUrlInfo = {
  owner: string;
  repo: string;
  ref?: string;
  path?: string;
  type: "root" | "tree" | "blob";
};

export type GitHubApiRepo = {
  default_branch?: string;
};

export type GitHubTreeItem = {
  path?: string;
  type?: string;
};

export type GitHubTreeResponse = {
  tree?: GitHubTreeItem[];
  truncated?: boolean;
};
