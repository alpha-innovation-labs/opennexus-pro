export type WebFetchFormat = "text" | "markdown" | "html";

export type WebFetchAttachment = {
  type: "file";
  mime: string;
  url: string;
};

export type WebFetchResult = {
  title: string;
  output: string;
  mime: string;
  contentType: string;
  attachment?: WebFetchAttachment;
};
