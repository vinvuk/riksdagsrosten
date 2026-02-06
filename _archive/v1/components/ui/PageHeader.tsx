import type { ReactNode } from "react";
import Breadcrumbs, { type BreadcrumbItem } from "./Breadcrumbs";

/**
 * Props for the PageHeader component.
 * @property title - Main page heading
 * @property subtitle - Optional description text below the title
 * @property breadcrumbs - Optional breadcrumb trail items
 * @property metadata - Optional ReactNode rendered below the title (badges, dates, etc.)
 * @property children - Optional right-side or below-title slot for page-specific content
 */
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  metadata?: ReactNode;
  children?: ReactNode;
}

/**
 * Consistent page header used across all pages.
 * Adapted from Tailwind Plus "With meta, actions, and breadcrumbs".
 * Renders an optional breadcrumb trail, a title, optional subtitle/metadata,
 * and a children slot for page-specific content (portraits, icons, etc.).
 * @param props - Page header configuration
 * @returns A header section with breadcrumbs, title, and optional content
 */
export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  metadata,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-3">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-base-content sm:truncate sm:tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-base-content/70">{subtitle}</p>
          )}
          {metadata && (
            <div className="mt-2 flex flex-col sm:mt-1 sm:flex-row sm:flex-wrap sm:gap-x-4">
              {metadata}
            </div>
          )}
        </div>
        {children && (
          <div className="mt-5 lg:mt-0 lg:ml-4">{children}</div>
        )}
      </div>
    </div>
  );
}
