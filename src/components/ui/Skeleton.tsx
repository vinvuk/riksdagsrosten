import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton loading placeholder component.
 * Used to show loading state while content is being fetched.
 * @param className - Additional CSS classes for sizing
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700",
        className
      )}
    />
  );
}

/**
 * Skeleton for a card/stat box.
 */
export function SkeletonCard() {
  return (
    <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

/**
 * Skeleton for a list item with avatar.
 */
export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 px-4 py-4 bg-white dark:bg-zinc-900">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="size-5" />
    </div>
  );
}

/**
 * Skeleton for a vote list item.
 */
export function SkeletonVoteItem() {
  return (
    <div className="flex items-center gap-4 px-4 py-4 bg-white dark:bg-zinc-900">
      <Skeleton className="size-4 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2 w-full mt-2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

/**
 * Skeleton for a stats grid.
 */
export function SkeletonStatsGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for a list of items.
 */
export function SkeletonList({ count = 5, type = "member" }: { count?: number; type?: "member" | "vote" }) {
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden">
      {Array.from({ length: count }).map((_, i) =>
        type === "vote" ? <SkeletonVoteItem key={i} /> : <SkeletonListItem key={i} />
      )}
    </div>
  );
}
