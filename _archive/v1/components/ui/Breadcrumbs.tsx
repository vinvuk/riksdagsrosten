import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/**
 * A single breadcrumb item.
 * @property label - Display text for the breadcrumb
 * @property href - Optional link target; omit for the current (last) item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Props for the Breadcrumbs component.
 * @property items - Ordered list of breadcrumb items (first = root, last = current)
 */
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Renders a breadcrumb navigation trail with chevron separators.
 * Adapted from Tailwind Plus "Simple with chevrons".
 * Uses next/link for client-side navigation and lucide-react icons.
 * @param props - The breadcrumb items to display
 * @returns A nav element with an ordered breadcrumb list
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <Link href="/" className="text-base-content/60 hover:text-base-content">
            <Home aria-hidden="true" className="size-5 shrink-0" />
            <span className="sr-only">Hem</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.label}>
            <div className="flex items-center">
              <ChevronRight
                aria-hidden="true"
                className="size-5 shrink-0 text-base-content/60"
              />
              {item.href ? (
                <Link
                  href={item.href}
                  className="ml-4 text-sm font-medium text-base-content/70 hover:text-base-content"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={index === items.length - 1 ? "page" : undefined}
                  className="ml-4 text-sm font-medium text-base-content/90"
                >
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
