import { stripVTControlCharacters } from "node:util";

export function stripAnsi(text: string): string {
	return stripVTControlCharacters(text);
}
