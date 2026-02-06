"use client";

import { createContext, useContext, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { Menu, X } from "lucide-react";

interface SidebarCloseContext {
  close: () => void;
}

const SidebarContext = createContext<SidebarCloseContext | null>(null);

/**
 * Hook to access the sidebar close function.
 * Used by SidebarItem to auto-close the mobile drawer on navigation.
 * @returns Object with close() method
 */
export function useSidebarClose(): SidebarCloseContext {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebarClose must be used within a SidebarLayout");
  }
  return ctx;
}

interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  navbar: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Responsive sidebar layout shell.
 * Renders a fixed sidebar on desktop (lg+) and a HeadlessUI Dialog drawer on mobile.
 * Provides close context so sidebar items can dismiss the mobile drawer on click.
 * @param sidebar - Sidebar component tree
 * @param navbar - Mobile navbar content (shown in sticky top bar below lg)
 * @param children - Main content area
 */
export function SidebarLayout({ sidebar, navbar, children }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ close: () => setSidebarOpen(false) }}>
      {/* Mobile sidebar — HeadlessUI Dialog for accessibility */}
      <Dialog
        open={sidebarOpen}
        onClose={setSidebarOpen}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-zinc-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="-m-2.5 p-2.5"
                >
                  <span className="sr-only">Stäng meny</span>
                  <X aria-hidden="true" className="size-6 text-white" />
                </button>
              </div>
            </TransitionChild>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-zinc-900 px-6 pt-4 pb-4 ring-1 ring-white/10">
              {sidebar}
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Static sidebar for desktop */}
      <div className="hidden bg-zinc-900 ring-1 ring-white/10 lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-6 pt-4 pb-4">
          {sidebar}
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 bg-zinc-900 border-b border-white/10 px-4 text-zinc-100 sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="-m-2.5 p-2.5 text-zinc-400"
        >
          <span className="sr-only">Öppna meny</span>
          <Menu aria-hidden="true" className="size-6" />
        </button>
        {navbar}
      </div>

      {/* Main content area */}
      <main className="lg:pl-72 lg:pt-2 lg:pr-2 pb-2 min-h-screen">
        <div className="min-h-screen bg-white dark:bg-zinc-900 lg:rounded-lg">
          {children}
        </div>
      </main>
    </SidebarContext.Provider>
  );
}
