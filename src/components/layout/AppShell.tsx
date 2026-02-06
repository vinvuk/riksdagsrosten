"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Vote,
  Landmark,
  BookOpen,
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
import SkipToContent from "@/components/ui/SkipToContent";
import BackToTop from "@/components/ui/BackToTop";
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

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Multi-column application shell composed from Catalyst-style sidebar primitives.
 * Provides dark sidebar navigation, mobile drawer, pagination, and an aside column.
 * @param children - Page content rendered in the main area
 */
export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

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
              <ThemeToggle className="ml-auto text-zinc-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg max-lg:hidden" />
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
          </Sidebar>
        }
        navbar={
          <Navbar>
            <NavbarSection>
              <NavbarItem className="text-zinc-100">{getPageTitle(pathname)}</NavbarItem>
            </NavbarSection>
            <NavbarSpacer />
            <NavbarSection>
              <ThemeToggle className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-white/5" />
            </NavbarSection>
          </Navbar>
        }
      >
        <main id="main-content">
          {children}
        </main>
      </SidebarLayout>
      <BackToTop />
    </>
  );
}
