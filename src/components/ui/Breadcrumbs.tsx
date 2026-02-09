import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb navigation component for better wayfinding.
 * @param items - Array of breadcrumb items with label and optional href
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
        <li>
          <Link
            href="/"
            className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            aria-label="Hem"
          >
            <Home className="size-4" />
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.href || item.label} className="flex items-center gap-1">
            <ChevronRight className="size-4 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-zinc-900 dark:text-zinc-100 font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
