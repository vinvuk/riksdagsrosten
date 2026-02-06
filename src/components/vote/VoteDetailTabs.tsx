"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Select } from "@/components/catalyst/select";

/**
 * A single tab definition.
 * @property name - Display label for the tab
 * @property content - ReactNode to render when this tab is active
 */
interface TabItem {
  name: string;
  content: ReactNode;
}

/**
 * Props for the VoteDetailTabs component.
 * @property tabs - Array of tab objects with name and content
 */
interface VoteDetailTabsProps {
  tabs: TabItem[];
}

/**
 * Client-side tab component for the vote detail page.
 * Adapted from Tailwind Plus "Tabs with underline".
 * Shows a select dropdown on mobile and underline tabs on desktop.
 * @param props - The tabs to display
 * @returns A tabbed interface that switches between content sections
 */
export default function VoteDetailTabs({ tabs }: VoteDetailTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Guard against empty tabs array
  if (!tabs || tabs.length === 0) {
    return null;
  }

  const activeTab = tabs[activeIndex] || tabs[0];

  return (
    <div>
      {/* Mobile: select dropdown */}
      <div className="sm:hidden">
        <Select
          value={activeTab.name}
          aria-label="Välj flik"
          onChange={(e) => {
            const index = tabs.findIndex((t) => t.name === e.target.value);
            if (index >= 0) setActiveIndex(index);
          }}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </Select>
      </div>

      {/* Desktop: underline tabs */}
      <div className="hidden sm:block">
        <div className="border-b border-zinc-200 dark:border-zinc-700">
          <nav aria-label="Flikar" className="-mb-px flex space-x-8">
            {tabs.map((tab, index) => (
              <button
                key={tab.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-current={index === activeIndex ? "page" : undefined}
                className={cn(
                  "border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap",
                  index === activeIndex
                    ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-zinc-500 dark:text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-6">{activeTab.content}</div>
    </div>
  );
}
