"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "../../../utils/cn";
import type { ShowcaseGroup } from "../types/showcase-feature";
import { getFirstShowcaseExampleId } from "../utils/get-first-showcase-example-id";
import { getFirstShowcaseGroupId } from "../utils/get-first-showcase-group-id";
import { getShowcaseStoryProgress } from "../utils/get-showcase-story-progress";

export type ShowcaseNavProps = {
  readonly groups: readonly ShowcaseGroup[];
};

/**
 * Renders the sticky showcase navigation with React scroll-spy state.
 *
 * @param props Feature groups and examples to navigate.
 * @returns A two-layer feature showcase navigation.
 */
export function ShowcaseNav(props: ShowcaseNavProps) {
  const [activeGroupId, setActiveGroupId] = useState(getFirstShowcaseGroupId(props.groups));
  const [activeExampleId, setActiveExampleId] = useState(getFirstShowcaseExampleId(props.groups));
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    let frameId = 0;
    const observerOptions = { rootMargin: "-35% 0px -50% 0px", threshold: 0 };
    const majorObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const groupId = entry.target.getAttribute("data-showcase-major");
        if (entry.isIntersecting && groupId) setActiveGroupId(groupId);
      });
    }, observerOptions);
    const childObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const exampleId = entry.target.getAttribute("data-showcase-child");
        if (entry.isIntersecting && exampleId) setActiveExampleId(exampleId);
      });
    }, observerOptions);

    /** Synchronizes feature navigation visibility with terminal settle progress. */
    function updateNavVisibility(): void {
      frameId = 0;
      const story = document.querySelector<HTMLElement>(".feature-story-grid");
      const progress = story ? getShowcaseStoryProgress(story.getBoundingClientRect(), window.innerHeight) : 0;

      setIsSettled(progress >= 1);
    }

    /** Queues one visibility update for scroll and resize events. */
    function scheduleNavVisibilityUpdate(): void {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateNavVisibility);
    }

    document.querySelectorAll("[data-showcase-major]").forEach((section) => majorObserver.observe(section));
    document.querySelectorAll("[data-showcase-child]").forEach((section) => childObserver.observe(section));
    updateNavVisibility();
    window.addEventListener("scroll", scheduleNavVisibilityUpdate, { passive: true });
    window.addEventListener("resize", scheduleNavVisibilityUpdate, { passive: true });

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      majorObserver.disconnect();
      childObserver.disconnect();
      window.removeEventListener("scroll", scheduleNavVisibilityUpdate);
      window.removeEventListener("resize", scheduleNavVisibilityUpdate);
    };
  }, []);

  return (
    <nav className={cn("feature-sticky-nav sticky top-16 z-40 border-b border-neutral-200/70 bg-neutral-50/92 backdrop-blur-lg transition duration-200 dark:border-white/10 dark:bg-black/90 max-[860px]:static max-[860px]:overflow-x-auto", !isSettled && "pointer-events-none opacity-0")} aria-label="Feature showcase navigation" aria-hidden={!isSettled}>
      <div className="feature-nav-inner mx-auto grid max-w-[1728px] gap-2 px-[36px] py-3 max-[860px]:min-w-max max-[860px]:px-8 max-[560px]:px-4">
        <div className="feature-major-nav flex flex-wrap items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.12em]">
          {props.groups.map((group) => (
            <Link className={cn("px-3 py-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-neutral-100", activeGroupId === group.id && "bg-neutral-950 text-white dark:bg-white dark:text-black")} href={`#${group.id}`} data-showcase-major-link={group.id} key={group.id} onClick={() => setActiveGroupId(group.id)}>
              {group.label}
            </Link>
          ))}
        </div>
        <div className="feature-child-nav flex flex-wrap items-center gap-2 font-mono text-xs font-semibold">
          {props.groups.flatMap((group) => group.examples.map((example) => (
            <Link className={cn("px-3 py-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-neutral-100", activeExampleId === example.id && "bg-neutral-950 text-white dark:bg-white dark:text-black")} href={`#${example.id}`} data-showcase-child-link={example.id} data-showcase-parent={group.id} hidden={activeGroupId !== group.id} key={example.id} onClick={() => setActiveExampleId(example.id)}>
              {example.eyebrow}
            </Link>
          )))}
        </div>
      </div>
    </nav>
  );
}
