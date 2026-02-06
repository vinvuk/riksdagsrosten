import { PARTIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PartyBadgeProps {
  parti: string;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Renders a party-colored badge pill with the party code or full name.
 * Uses inline backgroundColor from PARTIES constant for dynamic party colors.
 * @param parti - Party code (S, M, SD, KD, L, C, MP, V)
 * @param showName - Show full party name instead of code
 * @param size - Badge size variant (default "sm")
 */
export default function PartyBadge({
  parti,
  showName = false,
  size = "sm",
}: PartyBadgeProps) {
  const party = PARTIES[parti];

  if (!party) {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 text-xs font-medium text-zinc-900 dark:text-zinc-100">
        {parti}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold",
        party.text,
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-sm",
        size === "lg" && "size-12 text-lg"
      )}
      style={{ backgroundColor: party.hex }}
    >
      {showName ? party.name : parti}
    </span>
  );
}
