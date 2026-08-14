import { wcswidth } from 'simple-wcswidth';
import type { CharLengthDict } from '../models/common';

/* eslint-disable no-control-regex */
// Build regex dynamically to avoid literal escape character in source
const ESCAPE = String.fromCharCode(27);
const colorRegex = new RegExp(`${ESCAPE}\\[\\d{1,3}(;\\d{1,3})*m`, 'g'); // matches ANSI escape codes like \x1b[30m

export const stripAnsi = (str: string): string => str.replace(colorRegex, '');

export const findWidthInConsole = (
  str: string,
  charLength?: CharLengthDict
): number => {
  let strLen = 0;
  str = stripAnsi(str);
  if (charLength) {
    Object.entries(charLength).forEach(([key, value]) => {
      // count appearance of the key in the string and remove from original string
      const regex = new RegExp(key, 'g');
      strLen += (str.match(regex) || []).length * value;
      str = str.replace(key, '');
    });
  }
  strLen += wcswidth(str);
  return strLen;
};
