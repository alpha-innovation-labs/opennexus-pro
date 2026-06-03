/** Persisted steering queue item for one Nexus session. */
export interface SteerQueueItem {
  id: string;
  sessionId: string;
  message: string;
  createdAt: string;
  pid: number;
}
