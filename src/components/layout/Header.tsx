"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Vote } from "lucide-react";

const navigation = [
  { name: "Ledamöter", href: "/ledamot" },
  { name: "Voteringar", href: "/votering" },
  { name: "Partier", href: "/parti" },
  { name: "Ämnen", href: "/amne" },
];

/**
 * Site header with navigation and mobile menu.
 * Adapted from Tailwind Plus "With left-aligned nav" header.
 */
export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-base-100 shadow-sm sticky top-0 z-50">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
      >
        <div className="flex items-center gap-x-12">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <Vote className="h-7 w-7 text-primary" />
            <span className="hidden sm:block font-bold text-lg text-base-content">
              Riksdagsrösten
            </span>
          </Link>
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={
                  pathname.startsWith(item.href)
                    ? "text-sm/6 font-semibold text-primary"
                    : "text-sm/6 font-semibold text-base-content hover:text-primary"
                }
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="hidden lg:flex lg:items-center lg:gap-x-6">
          <Link
            href="/sok"
            className="flex items-center gap-2 text-sm/6 font-semibold text-base-content/60 hover:text-base-content"
          >
            <Search className="size-4" />
            Sök
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-base-content/70"
          >
            <span className="sr-only">Öppna meny</span>
            {mobileMenuOpen ? (
              <X aria-hidden="true" className="size-6" />
            ) : (
              <Menu aria-hidden="true" className="size-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-base-200">
          <div className="space-y-1 px-6 py-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={
                  pathname.startsWith(item.href)
                    ? "-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-primary bg-primary/5"
                    : "-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-base-content hover:bg-base-200"
                }
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-base-200 mt-4">
              <Link
                href="/sok"
                onClick={() => setMobileMenuOpen(false)}
                className="-mx-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-base/7 font-semibold text-base-content hover:bg-base-200"
              >
                <Search className="size-5" />
                Sök
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
