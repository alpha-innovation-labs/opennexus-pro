/** Tetris cell palette values used by the game board. */
export type TetrisCell = "" | "I" | "O" | "T" | "S" | "Z" | "J" | "L";

/** Active falling piece state. */
export type TetrisActivePiece = {
	kind: Exclude<TetrisCell, "">;
	shape: number[][];
	row: number;
	column: number;
};

/** Mutable Tetris game state shared between hidden and visible modal sessions. */
export type TetrisGame = {
	width: number;
	height: number;
	board: TetrisCell[][];
	active: TetrisActivePiece;
	nextKind: Exclude<TetrisCell, "">;
	pieceIndex: number;
	score: number;
	lines: number;
	level: number;
	gameOver: boolean;
	paused: boolean;
};

/** Optional runtime controls for the Tetris modal timer. */
export type TetrisModalOptions = {
	autoStart?: boolean;
	autoStartMusic?: boolean;
	initialFullScreen?: boolean;
	tickMs?: number;
};
