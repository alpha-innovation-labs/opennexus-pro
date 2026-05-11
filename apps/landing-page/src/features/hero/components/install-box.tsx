"use client";

import { useMemo, useState } from "react";
import { cn } from "../../../utils/cn";
import { installOptions } from "../data/install-options";
import { copyInstallCommand } from "../utils/copy-install-command";
import { getActiveInstallOption } from "../utils/get-active-install-option";
import { CheckIcon } from "./check-icon";
import { CopyIcon } from "./copy-icon";

/**
 * Renders the Lazyskills install command design with Nexus package-manager commands.
 *
 * @returns The install command card.
 */
export function InstallBox() {
  const [activeId, setActiveId] = useState(installOptions[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const activeInstall = useMemo(() => getActiveInstallOption(installOptions, activeId), [activeId]);

  /** Handles user requests to copy the active install command. */
  async function handleCopy(): Promise<void> {
    if (!activeInstall) return;

    const didCopy = await copyInstallCommand(activeInstall.command);
    if (!didCopy) return;

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="install-box w-[350px] max-w-full overflow-hidden border border-border/60 bg-card text-left text-foreground">
      <div className="flex flex-col">
        <div role="tablist" aria-orientation="horizontal" className="install-tabs flex flex-wrap border-b border-border/60 bg-muted/40" tabIndex={0}>
          {installOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={option.id === activeId}
              data-state={option.id === activeId ? "active" : "inactive"}
              className={cn(
                "install-tab cursor-pointer border-r border-border/50 px-4 py-2.5 font-mono text-xs tracking-normal text-muted-foreground transition last:border-r-0 hover:bg-background/70 hover:text-foreground",
                option.id === activeId && "bg-background text-foreground",
              )}
              tabIndex={-1}
              onClick={() => setActiveId(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="install-command-row flex items-start gap-3 bg-background px-4 py-3" data-install-command={activeInstall?.command}>
          <span className="pt-0.5 text-emerald-500" aria-hidden="true">$</span>
          <code className="flex-1 overflow-x-auto font-mono text-sm leading-6 whitespace-pre">{activeInstall?.command}</code>
          <button
            className={cn(
              "install-copy-button inline-flex h-8 w-8 cursor-pointer items-center justify-center whitespace-nowrap rounded-none border border-border/60 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
              copied && "bg-muted text-foreground",
            )}
            type="button"
            data-install-copy
            data-copied={copied ? "true" : undefined}
            aria-label="Copy install command"
            onClick={handleCopy}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}
