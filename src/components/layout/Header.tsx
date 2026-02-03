"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Vote } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/ledamot", label: "Ledamöter" },
  { href: "/votering", label: "Voteringar" },
  { href: "/parti", label: "Partier" },
  { href: "/amne", label: "Ämnen" },
];

/**
 * Site header with navigation, search bar, and mobile menu.
 * Adapted from Tailwind Plus "With search" navbar template.
 */
export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-base-100 shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo + desktop nav */}
          <div className="flex">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Vote className="h-7 w-7 text-primary" />
              <span className="hidden sm:block font-bold text-lg text-base-content">
                Riksdagsrösten
              </span>
            </Link>
            <div className="hidden lg:ml-8 lg:flex lg:space-x-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                    pathname.startsWith(item.href)
                      ? "border-primary text-base-content"
                      : "border-transparent text-base-content/60 hover:border-base-300 hover:text-base-content"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <Link
              href="/sok"
              className="grid w-full max-w-lg grid-cols-1 lg:max-w-xs"
            >
              <div className="col-start-1 row-start-1 flex items-center rounded-md bg-base-200 py-1.5 pr-3 pl-10 text-sm text-base-content/50 hover:bg-base-300 transition-colors cursor-pointer">
                Sök ledamot, votering eller ämne...
              </div>
              <Search
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-base-content/40"
              />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn btn-ghost btn-sm"
              aria-label="Öppna meny"
            >
              {mobileOpen ? (
                <X className="size-6" />
              ) : (
                <Menu className="size-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-base-200">
          <div className="space-y-1 pt-2 pb-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block border-l-4 py-2 pr-4 pl-3 text-base font-medium",
                  pathname.startsWith(item.href)
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-base-content/60 hover:border-base-300 hover:bg-base-200 hover:text-base-content"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
