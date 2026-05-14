/**
 * One LLM-recreated observation topic with the source user messages it covers.
 */
export type RecreatedObservationTopic = {
  title: string;
  sourceMessageIndexes: number[];
};
