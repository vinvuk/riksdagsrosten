import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Mobile navbar wrapper rendered inside the sticky top bar.
 * Provides a flex row layout for navbar sections and spacers.
 * @param children - NavbarSection and NavbarSpacer elements
 */
export function Navbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 items-center gap-x-6">{children}</div>;
}

/**
 * Groups related navbar items together.
 * @param children - NavbarItem elements
 */
export function NavbarSection({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-x-4">{children}</div>;
}

interface NavbarItemProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}

/**
 * Individual navbar item. Renders as a Next.js Link when href is provided.
 * @param href - Navigation URL (renders Link when provided)
 * @param className - Additional class overrides
 * @param children - Item content (icon or text)
 */
export function NavbarItem({
  href,
  className,
  children,
  "aria-label": ariaLabel,
}: NavbarItemProps) {
  const baseClasses = cn(
    "text-sm/6 font-semibold text-zinc-900 dark:text-zinc-100",
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return <div className={baseClasses}>{children}</div>;
}

/**
 * Flexible spacer that pushes navbar sections apart.
 */
export function NavbarSpacer() {
  return <div className="flex-1" aria-hidden="true" />;
}
