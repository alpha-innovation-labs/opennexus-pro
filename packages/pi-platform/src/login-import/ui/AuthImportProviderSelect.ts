import { Container, getKeybindings, Spacer, Text } from "@mariozechner/pi-tui";
import type { AuthImportCandidate } from "../model/AuthImportCandidate.js";

/**
 * In-modal multi-select for choosing auth providers to import.
 */
export class AuthImportProviderSelect extends Container {
	private readonly candidates: readonly AuthImportCandidate[];
	private readonly onSubmit: (selectedCandidates: AuthImportCandidate[]) => void;
	private readonly onCancel: () => void;
	private readonly selectedProviderIds = new Set<string>();
	private readonly listContainer = new Container();
	private selectedIndex = 0;

	/**
	 * Creates an auth import provider selector.
	 *
	 * @param candidates Importable provider candidates.
	 * @param onSubmit Called with selected candidates on Enter.
	 * @param onCancel Called when the selector is cancelled.
	 */
	constructor(
		candidates: readonly AuthImportCandidate[],
		onSubmit: (selectedCandidates: AuthImportCandidate[]) => void,
		onCancel: () => void,
	) {
		super();
		this.candidates = candidates;
		this.onSubmit = onSubmit;
		this.onCancel = onCancel;
		this.addChild(new Text("Select providers to import", 1, 0));
		this.addChild(new Spacer(1));
		this.addChild(this.listContainer);
		this.addChild(new Spacer(1));
		this.addChild(new Text("Space toggle · Enter import · Esc cancel", 1, 0));
		this.updateList();
	}

	/**
	 * Handles navigation, toggle, confirm, and cancel input.
	 *
	 * @param keyData Raw terminal input.
	 */
	handleInput(keyData: string): void {
		const kb = getKeybindings();
		if (kb.matches(keyData, "tui.select.up") || keyData === "k") {
			this.selectedIndex = Math.max(0, this.selectedIndex - 1);
			this.updateList();
			return;
		}
		if (kb.matches(keyData, "tui.select.down") || keyData === "j") {
			this.selectedIndex = Math.min(this.candidates.length - 1, this.selectedIndex + 1);
			this.updateList();
			return;
		}
		if (keyData === " ") {
			this.toggleSelectedCandidate();
			this.updateList();
			return;
		}
		if (kb.matches(keyData, "tui.select.confirm") || keyData === "\n" || keyData === "\r") {
			this.onSubmit(this.getSelectedCandidates());
			return;
		}
		if (kb.matches(keyData, "tui.select.cancel") || keyData === "\x1b") {
			this.onCancel();
		}
	}

	/**
	 * Toggles the currently highlighted candidate.
	 */
	private toggleSelectedCandidate(): void {
		const candidate = this.candidates[this.selectedIndex];
		if (!candidate) return;
		if (this.selectedProviderIds.has(candidate.providerId)) {
			this.selectedProviderIds.delete(candidate.providerId);
			return;
		}
		this.selectedProviderIds.add(candidate.providerId);
	}

	/**
	 * Reads selected import candidates in visible order.
	 *
	 * @returns Selected candidates.
	 */
	private getSelectedCandidates(): AuthImportCandidate[] {
		return this.candidates.filter((candidate) => this.selectedProviderIds.has(candidate.providerId));
	}

	/**
	 * Rebuilds the selector rows.
	 */
	private updateList(): void {
		this.listContainer.clear();
		for (let index = 0; index < this.candidates.length; index += 1) {
			const candidate = this.candidates[index];
			if (!candidate) continue;
			const cursor = index === this.selectedIndex ? "→" : " ";
			const checked = this.selectedProviderIds.has(candidate.providerId) ? "●" : "○";
			const hint = candidate.sourceProviderId === candidate.providerId
				? candidate.providerId
				: `${candidate.sourceProviderId} → ${candidate.providerId}`;
			this.listContainer.addChild(new Text(`${cursor} ${checked} ${candidate.displayName}  ${hint}`, 1, 0));
		}
	}
}
