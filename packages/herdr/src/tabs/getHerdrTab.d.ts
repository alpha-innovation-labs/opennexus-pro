/**
 * Gets details for a single Herdr tab.
 * Mirrors `herdr tab get`.
 *
 * @param tabId The tab ID (e.g. "w42:t1").
 * @returns Tab details including label, number, and paneCount.
 */
export declare function getHerdrTab(tabId: string): {
    tabId: string;
    label?: string;
    number: number;
    paneCount: number;
};
