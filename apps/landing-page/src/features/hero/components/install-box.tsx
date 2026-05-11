"use client";

import { useState } from "react";
import { cn } from "../../../utils/cn";
import { copyInstallCommand } from "../utils/copy-install-command";
import { CopyIcon } from "./copy-icon";

const installCommand = "npm install -g opennexus";

/**
 * Renders the install command with a React-powered clipboard control.
 *
 * @returns The install command card.
 */
export function InstallBox() {
  const [copied, setCopied] = useState(false);

  /** Handles user requests to copy the install command. */
  async function handleCopy(): Promise<void> {
    const didCopy = await copyInstallCommand(installCommand);
    if (!didCopy) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="install-box w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/90 text-left shadow-[0_18px_60px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-white/15 dark:bg-neutral-950/90 dark:shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
      <div className="install-command-row flex items-center gap-3 bg-gradient-to-br from-white/95 to-neutral-50/90 py-3 pr-3 pl-4 dark:from-neutral-950 dark:to-neutral-900" data-install-command={installCommand}>
        <span className="install-prompt font-mono text-sm font-bold leading-6 text-emerald-500" aria-hidden="true">$</span>
        <code className="flex-1 overflow-x-auto whitespace-pre font-mono text-sm font-semibold leading-6 text-neutral-950 dark:text-neutral-100">{installCommand}</code>
        <button
          className={cn(
            "install-copy-button inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-neutral-200/70 bg-white/80 text-neutral-500 hover:bg-neutral-950 hover:text-white dark:border-white/15 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-black",
            copied && "bg-neutral-950 text-white dark:bg-white dark:text-black",
          )}
          type="button"
          data-install-copy
          data-copied={copied ? "true" : undefined}
          aria-label="Copy install command"
          onClick={handleCopy}
        >
          <CopyIcon />
        </button>
      </div>
    </div>
  );
}
