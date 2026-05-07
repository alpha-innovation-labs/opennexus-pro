import { type Focusable } from "@mariozechner/pi-tui";
import { SharedModal } from "@nexus/tui-kit/modal/index.js";
import { hardDropTetrisPiece } from "../game/hardDropTetrisPiece.js";
import { moveTetrisPiece } from "../game/moveTetrisPiece.js";
import { resetTetrisGame } from "../game/resetTetrisGame.js";
import { rotateTetrisPiece } from "../game/rotateTetrisPiece.js";
import { softDropTetrisPiece } from "../game/softDropTetrisPiece.js";
import { tickTetrisGame } from "../game/tickTetrisGame.js";
import type { TetrisGame, TetrisModalOptions } from "../game/types.js";
import { ensureTetrisMusicRunning, isTetrisMusicRunning, stopTetrisMusicRuntime } from "../music/tetrisMusicRuntime.js";
import { getTetrisMusicPreference, setTetrisMusicPreference } from "../music/tetrisMusicPreference.js";
import { getTetrisSettingsPreference, setTetrisSettingsPreference } from "../settings/tetrisSettingsPreference.js";
import { createTetrisModalLines } from "./createTetrisModalLines.js";
import { isTetrisDown, isTetrisEscape, isTetrisLeft, isTetrisQuit, isTetrisRight, isTetrisUp } from "./isTetrisKey.js";
import type { TetrisModalHost } from "./TetrisModalHost.js";

/** Full-screen Tetris overlay controlled by keyboard input. */
export class TetrisModal extends SharedModal implements Focusable {
	private focusedState = false;
	private fullscreenEnabled: boolean;
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
		theme: any,
		private readonly game: TetrisGame,
		private readonly closeModal: () => void,
		private readonly options: TetrisModalOptions = {},
	) {
		super({
			headerLines: [theme.fg("accent", theme.bold("Tetris"))],
			maxWidth: 116,
			maxWidthRatio: 0.94,
			minWidth: 40,
			panes: [{ id: "tetris", size: 1, lines: [] }],
			theme,
		});
		this.fullscreenEnabled = getTetrisSettingsPreference().fullscreen;
		this.musicEnabled = options.autoStartMusic === false ? false : getTetrisMusicPreference();
		this.game.paused = false;
		if (options.autoStart !== false) this.startTimer();
		if (this.musicEnabled) this.startMusic();
	}

	/** Returns whether the modal owns focus. */
	get focused(): boolean { return this.focusedState; }

	/** Updates the modal focus state. */
	set focused(value: boolean) { this.focusedState = value; }

	/** Handles movement, rotation, pausing, restart, and close keys. */
	override handleInput(data: string): void {
		if (isTetrisEscape(data) || isTetrisQuit(data)) return this.close();
		if (data === "p") return this.togglePause();
		if (data === "r") return this.restart();
		if (data === "m") return this.toggleMusic();
		if (data === "f") return this.toggleFullscreen();
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
		const modalWidth = this.fullscreenEnabled ? width : Math.min(width, 116, Math.max(40, Math.floor(width * 0.94)));
		const innerWidth = Math.max(1, modalWidth - 2);
		const bodyHeight = this.fullscreenEnabled ? Math.max(12, (this.tui.terminal?.rows ?? 30) - 4) : Math.max(12, Math.min(34, (this.tui.terminal?.rows ?? 30) - 8));
		this.panes = [{ id: "tetris", size: 1, lines: createTetrisModalLines(this.theme, this.game, innerWidth, bodyHeight, this.musicEnabled && isTetrisMusicRunning()) }];
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
		this.stopMusic();
		this.closeModal();
	}

	/** Toggles in-modal pause state. */
	private togglePause(): void {
		this.game.paused = !this.game.paused;
		if (this.musicEnabled) this.startMusic();
		this.tui.requestRender();
	}

	/** Toggles fullscreen layout preference. */
	private toggleFullscreen(): void {
		this.fullscreenEnabled = !this.fullscreenEnabled;
		setTetrisSettingsPreference({ fullscreen: this.fullscreenEnabled });
		this.setWidthPolicy(40, this.fullscreenEnabled ? undefined : 116, this.fullscreenEnabled ? 1 : 0.94, this.fullscreenEnabled, () => this.tui.terminal?.rows ?? 30);
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
