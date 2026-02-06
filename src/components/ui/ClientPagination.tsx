"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Client-side pagination controls with prev/next buttons and page indicator.
 * Designed for use in client components with useState for page tracking.
 * @param currentPage - Current page number (1-indexed)
 * @param totalPages - Total number of pages
 * @param totalItems - Total number of items
 * @param itemsPerPage - Number of items per page
 * @param onPageChange - Callback when page changes
 * @param className - Additional classes for the container
 */
export default function ClientPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: ClientPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700 pt-4",
        className
      )}
    >
      {/* Item count */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Visar{" "}
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {startItem}–{endItem}
        </span>{" "}
        av{" "}
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {totalItems.toLocaleString("sv-SE")}
        </span>
      </p>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Föregående sida"
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium",
            "ring-1 ring-inset ring-zinc-300 dark:ring-zinc-600",
            "text-zinc-700 dark:text-zinc-300",
            "hover:bg-zinc-50 dark:hover:bg-zinc-800",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
          )}
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Föregående</span>
        </button>

        {/* Page indicator */}
        <span className="text-sm text-zinc-500 dark:text-zinc-400 tabular-nums">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{currentPage}</span>
          {" / "}
          {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Nästa sida"
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium",
            "ring-1 ring-inset ring-zinc-300 dark:ring-zinc-600",
            "text-zinc-700 dark:text-zinc-300",
            "hover:bg-zinc-50 dark:hover:bg-zinc-800",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
          )}
        >
          <span className="hidden sm:inline">Nästa</span>
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
