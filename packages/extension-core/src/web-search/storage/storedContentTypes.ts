export type StoredFetchedUrl = {
  url: string;
  title: string;
  content: string;
  error: string | null;
};

export type StoredContentResult = {
  id: string;
  type: "fetch";
  timestamp: number;
  urls: StoredFetchedUrl[];
};
