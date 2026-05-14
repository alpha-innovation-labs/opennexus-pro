/**
 * One LLM-recreated observation topic with final rendered observation content.
 */
export type RecreatedObservationTopic = {
  title: string;
  sourceMessageIndexes: number[];
  userMessages?: string[];
  assistantBullets: string[];
};
