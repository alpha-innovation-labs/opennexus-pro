export type ChatStatusEntry = {
  id: string;
  sessionId: string;
  sessionFile?: string;
  sessionTitle?: string;
  cwd: string;
  pid: number;
  startedAt: string;
  updatedAt: string;
};

export type ChatStatusFile = {
  version: 1;
  entries: ChatStatusEntry[];
};
