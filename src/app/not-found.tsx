import Link from "next/link";
import { Home, Search, Users, Vote } from "lucide-react";
import { Button } from "@/components/catalyst/button";

/**
 * Custom 404 page shown when a route is not found.
 */
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-6xl font-bold text-blue-600 dark:text-blue-400">404</p>
        <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Sidan hittades inte
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
          Sidan du letar efter finns inte eller har flyttats. Använd länkarna nedan för att navigera.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button href="/" color="blue">
            <Home data-slot="icon" />
            Till startsidan
          </Button>
          <Button href="/sok" plain>
            <Search data-slot="icon" />
            Sök
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-lg mx-auto">
          <Link
            href="/ledamot"
            className="flex flex-col items-center gap-2 p-4 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Users className="size-6 text-zinc-400" />
            <span className="text-sm text-zinc-600 dark:text-zinc-300">Ledamöter</span>
          </Link>
          <Link
            href="/votering"
            className="flex flex-col items-center gap-2 p-4 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Vote className="size-6 text-zinc-400" />
            <span className="text-sm text-zinc-600 dark:text-zinc-300">Voteringar</span>
          </Link>
          <Link
            href="/parti"
            className="flex flex-col items-center gap-2 p-4 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="size-6 rounded-full bg-gradient-to-br from-blue-500 to-red-500" />
            <span className="text-sm text-zinc-600 dark:text-zinc-300">Partier</span>
          </Link>
          <Link
            href="/amne"
            className="flex flex-col items-center gap-2 p-4 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="size-6 grid grid-cols-2 gap-0.5">
              <div className="bg-zinc-300 dark:bg-zinc-600 rounded-sm" />
              <div className="bg-zinc-300 dark:bg-zinc-600 rounded-sm" />
              <div className="bg-zinc-300 dark:bg-zinc-600 rounded-sm" />
              <div className="bg-zinc-300 dark:bg-zinc-600 rounded-sm" />
            </div>
            <span className="text-sm text-zinc-600 dark:text-zinc-300">Ämnen</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
