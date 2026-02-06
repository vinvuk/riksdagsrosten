"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Theme toggle button that switches between light and dark mode.
 * Reads the current theme from the data-theme attribute on <html>,
 * toggles it, and persists the preference in localStorage.
 */
export default function ThemeToggle() {
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
      className="btn btn-ghost btn-sm btn-circle"
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
