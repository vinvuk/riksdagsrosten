import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Wrapper nav element for the pagination component set.
 * Renders a top-bordered flex row with prev/next arrows and centered page numbers.
 * @param children - PaginationPrevious, PaginationList, PaginationNext
 */
export function Pagination({ children }: { children: React.ReactNode }) {
  return (
    <nav className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700">
      {children}
    </nav>
  );
}

interface PaginationLinkProps {
  href: string;
  children?: React.ReactNode;
}

/**
 * Left-aligned "Previous" navigation link with arrow icon.
 * @param href - URL for the previous page
 * @param children - Optional custom label (defaults to "Föregående")
 */
export function PaginationPrevious({ href, children }: PaginationLinkProps) {
  return (
    <div className="-mt-px flex w-0 flex-1">
      <Link
        href={href}
        className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <ArrowLeft aria-hidden="true" className="mr-3 size-5" />
        {children ?? "Föregående"}
      </Link>
    </div>
  );
}

/**
 * Right-aligned "Next" navigation link with arrow icon.
 * @param href - URL for the next page
 * @param children - Optional custom label (defaults to "Nästa")
 */
export function PaginationNext({ href, children }: PaginationLinkProps) {
  return (
    <div className="-mt-px flex w-0 flex-1 justify-end">
      <Link
        href={href}
        className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        {children ?? "Nästa"}
        <ArrowRight aria-hidden="true" className="ml-3 size-5" />
      </Link>
    </div>
  );
}

/**
 * Container for centered page number links. Hidden on mobile, visible from md breakpoint.
 * @param children - PaginationPage and PaginationGap elements
 */
export function PaginationList({ children }: { children: React.ReactNode }) {
  return <div className="hidden md:-mt-px md:flex">{children}</div>;
}

interface PaginationPageProps {
  href: string;
  current?: boolean;
  children: React.ReactNode;
}

/**
 * Individual page number link with active state indicator via top border.
 * @param href - URL for this page
 * @param current - Whether this page is the active page
 * @param children - Page number label
 */
export function PaginationPage({ href, current, children }: PaginationPageProps) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium",
        current
          ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
          : "border-transparent text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100"
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Static ellipsis gap indicator ("…") between non-contiguous page numbers.
 */
export function PaginationGap() {
  return (
    <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
      &hellip;
    </span>
  );
}
