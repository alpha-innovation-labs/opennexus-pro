/**
 * A bounded tail of a byte stream.
 *
 * Keeps only the last `maxBytes` of everything pushed to it. The registry uses
 * one per run for the child's stdout and stderr, kept as tails for error
 * reporting when the session file has no answer.
 */
export class OutputTail {
	/** The maximum number of bytes the tail holds. */
	readonly maxBytes: number;
	#buf: Buffer;

	constructor(maxBytes: number) {
		if (!Number.isInteger(maxBytes) || maxBytes <= 0) {
			throw new Error(
				`OutputTail maxBytes must be a positive integer, got ${maxBytes}.`,
			);
		}
		this.maxBytes = maxBytes;
		this.#buf = Buffer.alloc(0);
	}

	/** Append a chunk, keeping only the last `maxBytes` bytes. */
	push(chunk: Buffer): void {
		const next = Buffer.concat([this.#buf, chunk]);
		// `subarray` keeps the underlying buffer alive until the next push
		// replaces it, so the high-water mark is `maxBytes` plus one chunk —
		// bounded, and small relative to what an unbounded capture would cost.
		this.#buf =
			next.length > this.maxBytes
				? next.subarray(next.length - this.maxBytes)
				: next;
	}

	/** The tail so far, decoded as UTF-8. */
	get text(): string {
		return this.#buf.toString("utf8");
	}

	/** The number of bytes the tail currently holds. */
	get bytes(): number {
		return this.#buf.length;
	}
}
