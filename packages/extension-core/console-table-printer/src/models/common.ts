import type { ALIGNMENTS, COLORS } from '../utils/table-constants';

export type ALIGNMENT = (typeof ALIGNMENTS)[number];

export type COLOR = (typeof COLORS)[number];
export interface Dictionary {
  [key: string]: unknown;
}

export interface CharLengthDict {
  [key: string]: number;
}
export interface Row {
  color: COLOR;
  separator: boolean;
  text: Dictionary;
}
