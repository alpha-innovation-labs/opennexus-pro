import type { Focusable } from "@earendil-works/pi-tui";
import { SharedModal } from "@nexus/tui-kit/modal/index";
import type { SharedModalTheme } from "@nexus/tui-kit/modal/types";
import { hardDropTetrisPiece } from "../game/hardDropTetrisPiece";
import { moveTetrisPiece } from "../game/moveTetrisPiece";
import { resetTetrisGame } from "../game/resetTetrisGame";
import { rotateTetrisPiece } from "../game/rotateTetrisPiece";
import { softDropTetrisPiece } from "../game/softDropTetrisPiece";
import { tickTetrisGame } from "../game/tickTetrisGame";
import type { TetrisGame, TetrisModalOptions } from "../game/types";
import {
	getTetrisMusicPreference,
	setTetrisMusicPreference,
} from "../music/tetrisMusicPreference";
import {
	ensureTetrisMusicRunning,
	isTetrisMusicRunning,
	pauseTetrisMusicRuntime,
	stopTetrisMusicRuntime,
} from "../music/tetrisMusicRuntime";
import {
	getTetrisSettingsPreference,
	setTetrisSettingsPreference,
} from "../settings/tetrisSettingsPreference";
import { createTetrisModalLines } from "./createTetrisModalLines";
import {
	isTetrisDown,
	isTetrisEscape,
	isTetrisLeft,
	isTetrisQuit,
	isTetrisRight,
	isTetrisUp,
} from "./isTetrisKey";
import type { TetrisModalHost } from "./TetrisModalHost";

/** Full-screen Tetris overlay controlled by keyboard input. */
export class TetrisModal extends SharedModal implements Focusable {
	private focusedState = false;
	private fullScreenEnabled: boolean;
	private musicEnabled: boolean;
	private timer: NodeJS.Timeout | undefined;

	/**
	 * Creates the Tetris modal and resumes gameplay unless disabled by options.
	 *
	 * @param tui Active TUI instance.
	 * @param theme Active UI theme.
	 * @param game Shared game state.
	 * @param onClose Called when Escape hides the modal.
	 * @param options Timer options for runtime and tests.
	 */
	constructor(
		private readonly tui: TetrisModalHost,
		theme: SharedModalTheme & { bold: (text: string) => string },
		private readonly game: TetrisGame,
		private readonly closeModal: () => void,
		private readonly options: TetrisModalOptions = {},
	) {
		const initialFullScreen =
			options.initialFullScreen ?? getTetrisSettingsPreference().fullscreen;
		super({
			fullScreen: initialFullScreen,
			fullScreenRows: () => tui.terminal?.rows ?? 30,
			headerLines: [theme.fg("accent", theme.bold("Tetris"))],
			maxWidth: 116,
			maxWidthRatio: 0.94,
			minWidth: 40,
			onFullScreenChange: (enabled) => {
				this.fullScreenEnabled = enabled;
				setTetrisSettingsPreference({ fullscreen: enabled });
				tui.requestRender();
			},
			panes: [{ id: "tetris", size: 1, lines: [] }],
			theme,
		});
		this.fullScreenEnabled = initialFullScreen;
		this.musicEnabled =
			options.autoStartMusic === false ? false : getTetrisMusicPreference();
		this.game.paused = false;
		if (options.autoStart !== false) this.startTimer();
		if (this.musicEnabled) this.startMusic();
	}

	/** Returns whether the modal owns focus. */
	get focused(): boolean {
		return this.focusedState;
	}

	/** Updates the modal focus state. */
	set focused(value: boolean) {
		this.focusedState = value;
	}

	/** Handles movement, rotation, pausing, restart, and close keys. */
	override handleInput(data: string): void {
		if (isTetrisEscape(data) || isTetrisQuit(data)) {
			this.close();
			return;
		}
		if (data === "p") {
			this.togglePause();
			return;
		}
		if (data === "r") {
			this.restart();
			return;
		}
		if (data === "m") {
			this.toggleMusic();
			return;
		}
		super.handleInput(data);
		if (this.game.paused || this.game.gameOver) return;
		if (isTetrisLeft(data) || data === "a") moveTetrisPiece(this.game, -1);
		if (isTetrisRight(data) || data === "d") moveTetrisPiece(this.game, 1);
		if (isTetrisUp(data) || data === "w") rotateTetrisPiece(this.game);
		if (isTetrisDown(data) || data === "s") softDropTetrisPiece(this.game);
		if (data === " ") hardDropTetrisPiece(this.game);
		this.tui.requestRender();
	}

	/** Renders the full-screen shared modal with refreshed game lines. */
	override render(width: number): string[] {
		const modalWidth = this.fullScreenEnabled
			? width
			: Math.min(width, 116, Math.max(40, Math.floor(width * 0.94)));
		const innerWidth = Math.max(1, modalWidth - 2);
		const bodyHeight = this.fullScreenEnabled
			? Math.max(12, (this.tui.terminal?.rows ?? 30) - 6)
			: Math.max(12, Math.min(28, (this.tui.terminal?.rows ?? 30) - 10));
		this.panes = [
			{
				id: "tetris",
				size: 1,
				lines: createTetrisModalLines(
					this.theme as SharedModalTheme & { bold: (text: string) => string },
					this.game,
					innerWidth,
					bodyHeight,
					this.musicEnabled && isTetrisMusicRunning(),
				),
			},
		];
		return super.render(width);
	}

	/** Stops the timer when the modal is removed. */
	dispose(): void {
		this.stopTimer();
	}

	/** Starts the gravity timer. */
	private startTimer(): void {
		this.stopTimer();
		this.timer = setInterval(() => {
			if (tickTetrisGame(this.game)) this.tui.requestRender();
		}, this.options.tickMs ?? 180);
	}

	/** Stops the gravity timer. */
	private stopTimer(): void {
		if (this.timer) clearInterval(this.timer);
		this.timer = undefined;
	}

	/** Hides the modal and pauses the shared game. */
	private close(): void {
		this.game.paused = true;
		this.stopTimer();
		if (this.musicEnabled) pauseTetrisMusicRuntime();
		this.closeModal();
	}

	/** Toggles in-modal pause state. */
	private togglePause(): void {
		this.game.paused = !this.game.paused;
		if (this.musicEnabled) this.startMusic();
		this.tui.requestRender();
	}

	/** Toggles Tetris music playback. */
	private toggleMusic(): void {
		if (this.musicEnabled) {
			this.musicEnabled = false;
			setTetrisMusicPreference(false);
			this.stopMusic();
		} else {
			this.musicEnabled = true;
			setTetrisMusicPreference(true);
			this.startMusic();
		}
		this.tui.requestRender();
	}

	/** Starts Tetris music when an audio player is available. */
	private startMusic(): void {
		ensureTetrisMusicRunning();
	}

	/** Stops Tetris music if it is running. */
	private stopMusic(): void {
		stopTetrisMusicRuntime();
	}

	/** Restarts the game while keeping the modal open. */
	private restart(): void {
		resetTetrisGame(this.game);
		this.tui.requestRender();
	}
}
