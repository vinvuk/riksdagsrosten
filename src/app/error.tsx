"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/catalyst/button";

/**
 * Global error boundary for the application.
 * Catches runtime errors and displays a user-friendly message.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console in development
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
          <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Något gick fel
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
          Ett oväntat fel uppstod. Försök ladda om sidan eller gå tillbaka till startsidan.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
            Felkod: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={reset} color="blue">
            <RefreshCw data-slot="icon" />
            Försök igen
          </Button>
          <Button href="/" plain>
            <Home data-slot="icon" />
            Till startsidan
          </Button>
        </div>
      </div>
    </div>
  );
}
