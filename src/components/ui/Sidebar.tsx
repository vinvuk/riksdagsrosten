import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSidebarClose } from "@/components/ui/SidebarLayout";

/**
 * Top-level sidebar wrapper. Provides a flex column layout filling the full height.
 * @param children - SidebarHeader, SidebarBody, and optionally SidebarFooter
 */
export function Sidebar({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full flex-col">{children}</div>;
}

/**
 * Sidebar header area for branding/logo. Uses h-16 to align with Catalyst pattern.
 * @param children - Brand link or logo content
 */
export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-16 shrink-0 items-center">
      {children}
    </div>
  );
}

/**
 * Scrollable main body of the sidebar containing navigation sections.
 * @param children - SidebarSection elements, SidebarSpacer, etc.
 */
export function SidebarBody({ children }: { children: React.ReactNode }) {
  return (
    <nav className="flex flex-1 flex-col overflow-y-auto">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        {children}
      </ul>
    </nav>
  );
}

/**
 * Bottom section of the sidebar, separated from body by a subtle border.
 * @param children - Footer content (e.g. theme toggle, settings)
 */
export function SidebarFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "-mx-6 mt-auto border-t border-white/5 px-6 py-3",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Groups related sidebar items together. Renders as a <li> wrapping a <ul>.
 * @param children - SidebarHeading (optional) + SidebarItem elements
 * @param className - Additional classes
 */
export function SidebarSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <li className={className}>{children}</li>;
}

/**
 * Section heading text above a group of sidebar items. Matches Catalyst pattern.
 * @param children - Heading text
 */
export function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs/6 font-semibold text-zinc-400 px-2 mb-2">
      {children}
    </div>
  );
}

/**
 * List wrapper for SidebarItems. Use within SidebarSection after optional SidebarHeading.
 * @param children - SidebarItem elements
 */
export function SidebarList({ children }: { children: React.ReactNode }) {
  return (
    <ul role="list" className="-mx-2 space-y-1">
      {children}
    </ul>
  );
}

interface SidebarItemProps {
  href?: string;
  current?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

/**
 * Individual clickable sidebar navigation item.
 * Renders as a Next.js Link when href is provided, otherwise as a div.
 * Auto-closes the mobile sidebar drawer on click via context.
 * @param href - Navigation URL (renders Link when provided)
 * @param current - Whether this item represents the active page
 * @param className - Additional class overrides
 * @param children - Icon + label content
 * @param onClick - Optional click handler
 */
export function SidebarItem({
  href,
  current,
  className,
  children,
  onClick,
}: SidebarItemProps) {
  const { close } = useSidebarClose();

  const baseClasses = cn(
    "group flex gap-x-3 rounded-md px-3 py-2 text-sm/6 font-semibold",
    current
      ? "bg-white/5 text-white"
      : "text-zinc-400 hover:bg-white/5 hover:text-white",
    className
  );

  const handleClick = () => {
    close();
    onClick?.();
  };

  if (href) {
    return (
      <li>
        <Link href={href} onClick={handleClick} className={baseClasses}>
          {children}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div onClick={handleClick} className={baseClasses}>
        {children}
      </div>
    </li>
  );
}

/**
 * Text label within a SidebarItem, truncated on overflow.
 * @param children - Label text
 */
export function SidebarLabel({ children }: { children: React.ReactNode }) {
  return <span className="truncate">{children}</span>;
}

/**
 * Flexible spacer that pushes subsequent sidebar sections to the bottom.
 */
export function SidebarSpacer() {
  return <li className="mt-auto" aria-hidden="true" />;
}
