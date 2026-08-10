import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Key, matchesKey } from "@earendil-works/pi-tui";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { writeNexusUserConfig } from "@nexus/runtime/config/writeNexusUserConfig.js";
import { getBuiltinModels, getBuiltinProviders } from "@earendil-works/pi-ai/providers/all";
import type { Model, Api } from "@earendil-works/pi-ai";
import type { SlashMenuLeaf } from "../types.js";
import { createLoadingLeaf } from "../createLoadingLeaf.js";
import { filterMenuItems } from "../filterMenuItems.js";
import { toAutocompleteItems } from "../toAutocompleteItems.js";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/select/types.js";
import { createLoginProviderList } from "./createLoginProviderList.js";
import { createLoginModelList } from "./createLoginModelList.js";
import { filterLoginItems } from "./filterLoginItems.js";
import { resolveProviderModels } from "./resolveProviderModels.js";
import { toggleProviderEnabled } from "./toggleProviderEnabled.js";

const SLASH_MENU_LEFT_PANE_RATIO = 0.42;

/**
 * Two-pane login picker modal: left pane = provider list, right pane = models.
 *
 * Extends SelectPreviewModal to reuse its two-pane rendering. Provider toggles
 * persist to config.json under the `providers` key.
 */
export class LoginPickerModal extends SelectPreviewModal {
  private selectedProviderId: string | null = null;
  private query = "";
  private providerStates: Record<string, { enabled: boolean }> = {};
  private allProviders: SlashMenuLeaf[] = [];
  private allModelsByProvider = new Map<string, SlashMenuLeaf[]>();
  private catalogLoaded = false;
  private catalog: Array<{ provider: { id: string; name: string }; models: Model<Api>[] }> = [];

  constructor(
    uiTheme: SelectPreviewTheme,
    private readonly requestClose: () => void,
    private readonly requestRender: () => void,
    private readonly onCommandPicked: (commandText: string) => void,
    private readonly notify: (message: string, type: string) => void,
  ) {
    super(
      uiTheme,
      () => undefined,
      requestClose,
      undefined,
      {
        leftTitle: "Providers",
        rightTitle: "Models",
        bottomTitle: "Search",
        bottomPrefix: "> /",
        leftPaneRatio: SLASH_MENU_LEFT_PANE_RATIO,
        fullScreen: true,
      },
    );
    this.init();
  }

  /**
   * Initializes the modal: loads provider states, fetches the model catalog,
   * and renders the initial left-pane provider list.
   */
  private async init(): Promise<void> {
    const config = readNexusUserConfig();
    this.providerStates = config.providers ?? {};
    this.catalog = getBuiltinProviders().map((provider) => ({
      provider,
      models: getBuiltinModels(provider),
    }));
    this.allProviders = createLoginProviderList(this.providerStates);
    // Build the model map for all providers.
    for (const provider of this.catalog) {
      const models = createLoginModelList(provider.provider.id, "");
      this.allModelsByProvider.set(provider.provider.id, models);
    }
    this.renderLeftPane();
    this.requestRender();
  }

  /**
   * Renders the left-pane provider list with current filter state.
   */
  private renderLeftPane(): void {
    const { filteredProviders, filteredModelsByProvider } = filterLoginItems(
      this.allProviders,
      this.allModelsByProvider,
      this.query,
    );
    const items = toAutocompleteItems(filteredProviders);
    this.setItems(items);
    this.setTitles("Providers", this.selectedProviderId ?
      this.selectedProviderId : "Models");
    // Set right pane content
    if (this.selectedProviderId) {
      const models = filteredModelsByProvider.get(this.selectedProviderId) ?? [];
      if (models.length > 0) {
        this.setRightLines(models.map((m) => m.label));
      } else {
        this.setRightLines([`No models for ${this.selectedProviderId}`]);
      }
    } else {
      this.setRightLines(["Select a provider"]);
    }
    this.requestRender();
  }

  /**
   * Handles keyboard input for the login picker.
   */
  override handleInput(data: string): void {
    // Tab switches focus between left and right panes
    if (matchesKey(data, Key.tab)) {
      if (this.isRightPaneFocused()) {
        this.activePane = "left";
      } else {
        this.focusRightPane();
      }
      this.requestRender();
      return;
    }
    // Escape closes the modal
    if (matchesKey(data, Key.escape)) {
      this.saveProviderStates();
      this.requestClose();
      return;
    }
    // Delegate to parent for left-pane navigation
    if (!this.isRightPaneFocused()) {
      super.handleInput(data);
      return;
    }
    // Right pane: Escape or Tab goes back to left
    if (matchesKey(data, Key.escape) || matchesKey(data, Key.tab)) {
      this.activePane = "left";
      this.requestRender();
      return;
    }
    // Right pane: delegate scrolling
    super.handleInput(data);
  }

  /**
   * Called when an item is picked (Enter).
   */
  override handlePick(item: { value: string }): void {
    const isProvider = this.allProviders.some((p) => p.value === item.value);
    if (isProvider) {
      // Toggle provider enabled state
      const { states, nextEnabled } = toggleProviderEnabled(item.value);
      this.providerStates = states;
      // Rebuild provider list with updated states
      this.allProviders = createLoginProviderList(this.providerStates);
      // Select this provider and update right pane
      this.selectedProviderId = item.value;
      this.renderLeftPane();
      return;
    }
    // Model selection: dispatch /nexus-model-select
    this.onCommandPicked(`/nexus-model-select ${item.value}`);
    this.saveProviderStates();
    this.requestClose();
  }

  /**
   * Updates the search query and re-filters both panes.
   */
  updateQuery(newQuery: string): void {
    this.query = newQuery;
    this.renderLeftPane();
  }

  /**
   * Saves provider states to config.json, merging with existing config.
   */
  private saveProviderStates(): void {
    const config = readNexusUserConfig();
    writeNexusUserConfig({ ...config, providers: this.providerStates });
  }
}
