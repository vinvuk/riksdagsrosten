"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Theme toggle button that switches between light and dark mode.
 * Reads the current theme from the data-theme attribute on <html>,
 * toggles it, and persists the preference in localStorage.
 * @param className - Optional class override
 */
export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  /**
   * Reads the initial theme from the DOM on mount.
   * The inline head script will have already set the correct data-theme.
   */
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") {
      setTheme(current);
    }
  }, []);

  /**
   * Toggles the theme between light and dark, updating DOM and localStorage.
   */
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage may be unavailable
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={className ?? "rounded-full p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"}
      aria-label={
        theme === "dark" ? "Byt till ljust tema" : "Byt till mörkt tema"
      }
    >
      {theme === "dark" ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </button>
  );
}
