"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Vote,
  Landmark,
  BookOpen,
  Search,
  Info,
  GitCompare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarLayout } from "@/components/ui/SidebarLayout";
import {
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarSection,
  SidebarList,
  SidebarItem,
  SidebarLabel,
  SidebarSpacer,
} from "@/components/ui/Sidebar";
import {
  Navbar,
  NavbarSection,
  NavbarItem,
  NavbarSpacer,
} from "@/components/ui/Navbar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import CommandPalette from "@/components/search/CommandPalette";
import SkipToContent from "@/components/ui/SkipToContent";
import BackToTop from "@/components/ui/BackToTop";
import type { Member, VotingEventWithTitle } from "@/lib/types";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  { name: "Översikt", href: "/", icon: Home },
  { name: "Ledamöter", href: "/ledamot", icon: Users },
  { name: "Voteringar", href: "/votering", icon: Vote },
  { name: "Partier", href: "/parti", icon: Landmark },
  { name: "Ämnen", href: "/amne", icon: BookOpen },
  { name: "Jämför partier", href: "/jamfor", icon: GitCompare },
];

/**
 * Determines if a navigation item is active based on the current pathname.
 * @param pathname - Current route pathname
 * @param href - Navigation item href
 * @returns True if the nav item should be highlighted as active
 */
function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

/**
 * Returns the display title for the current page based on pathname.
 * @param pathname - Current route pathname
 * @returns Swedish page title string
 */
function getPageTitle(pathname: string): string {
  const nav = navigation.find((item) => isNavActive(pathname, item.href));
  return nav?.name ?? "Riksdagsrösten";
}

interface SearchData {
  members: Member[];
  votes: VotingEventWithTitle[];
}

interface AppShellProps {
  children: React.ReactNode;
  searchData: SearchData;
}

/**
 * Multi-column application shell composed from Catalyst-style sidebar primitives.
 * Provides dark sidebar navigation, mobile drawer, pagination, and an aside column.
 * @param children - Page content rendered in the main area
 */
export default function AppShell({ children, searchData }: AppShellProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <SkipToContent />
      <SidebarLayout
        sidebar={
          <Sidebar>
            <SidebarHeader>
              <Link
                href="/"
                className="text-lg font-bold text-white"
              >
                Riksdagsrösten
              </Link>
            </SidebarHeader>
            <SidebarBody>
              {/* Primary navigation */}
              <SidebarSection>
                <SidebarList>
                  {navigation.map((item) => {
                    const active = isNavActive(pathname, item.href);
                    return (
                      <SidebarItem
                        key={item.name}
                        href={item.href}
                        current={active}
                      >
                        <item.icon
                          aria-hidden="true"
                          className={cn(
                            active
                              ? "text-white"
                              : "text-zinc-400 group-hover:text-white",
                            "size-6 shrink-0"
                          )}
                        />
                        <SidebarLabel>{item.name}</SidebarLabel>
                      </SidebarItem>
                    );
                  })}
                </SidebarList>
              </SidebarSection>

              <SidebarSpacer />

              {/* Bottom navigation */}
              <SidebarSection>
                <SidebarList>
                  <SidebarItem href="/om">
                    <Info className="size-6 shrink-0" />
                    <SidebarLabel>Om Riksdagsrösten</SidebarLabel>
                  </SidebarItem>
                </SidebarList>
              </SidebarSection>
            </SidebarBody>
            <SidebarFooter className="max-lg:hidden">
              <ThemeToggle className="text-zinc-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg" />
            </SidebarFooter>
          </Sidebar>
        }
        navbar={
          <Navbar>
            <NavbarSection>
              <NavbarItem className="text-zinc-100">{getPageTitle(pathname)}</NavbarItem>
            </NavbarSection>
            <NavbarSpacer />
            <NavbarSection>
              <NavbarItem
                href="/sok"
                aria-label="Sök"
                className="text-zinc-400 hover:text-zinc-100"
              >
                <Search className="size-5" />
              </NavbarItem>
              <ThemeToggle className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-white/5" />
            </NavbarSection>
          </Navbar>
        }
      >
        {/* Desktop header with search and theme toggle */}
        <header className="hidden lg:sticky lg:top-0 lg:z-40 lg:flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 sm:px-6 lg:px-8 lg:rounded-t-lg">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex flex-1 items-center gap-x-2"
          >
            <Search className="size-5 text-zinc-400" />
            <span className="text-sm text-zinc-400">Sök...</span>
            <kbd className="ml-auto hidden lg:inline-flex items-center gap-0.5 rounded border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[0.625rem] font-medium text-zinc-500 dark:text-zinc-400">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
          <div className="flex items-center gap-x-4">
            <ThemeToggle className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" />
          </div>
        </header>
        <main id="main-content">
          {children}
        </main>
      </SidebarLayout>
      <BackToTop />

      {/* Command palette (⌘K) */}
      <CommandPalette
        data={searchData}
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </>
  );
}
