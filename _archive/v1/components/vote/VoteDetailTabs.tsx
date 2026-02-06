"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

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
 * Shows a DaisyUI select dropdown on mobile and underline tabs on desktop.
 * @param props - The tabs to display
 * @returns A tabbed interface that switches between content sections
 */
export default function VoteDetailTabs({ tabs }: VoteDetailTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      {/* Mobile: DaisyUI select dropdown */}
      <div className="grid grid-cols-1 sm:hidden">
        <select
          value={tabs[activeIndex].name}
          aria-label="Välj flik"
          onChange={(e) => {
            const index = tabs.findIndex((t) => t.name === e.target.value);
            if (index >= 0) setActiveIndex(index);
          }}
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-base-100 py-2 pr-8 pl-3 text-base text-base-content outline-1 -outline-offset-1 outline-base-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary"
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-base-content/60"
        />
      </div>

      {/* Desktop: underline tabs */}
      <div className="hidden sm:block">
        <div className="border-b border-base-300">
          <nav aria-label="Flikar" className="-mb-px flex space-x-8">
            {tabs.map((tab, index) => (
              <button
                key={tab.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-current={index === activeIndex ? "page" : undefined}
                className={clsx(
                  "border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap",
                  index === activeIndex
                    ? "border-primary text-primary"
                    : "border-transparent text-base-content/70 hover:border-base-content/40 hover:text-base-content"
                )}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-6">{tabs[activeIndex].content}</div>
    </div>
  );
}
