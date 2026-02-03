import { PARTIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PartyBadgeProps {
  parti: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

/**
 * Colored badge showing a party's abbreviation (and optionally full name).
 * @param parti - Party code (e.g. "S", "M", "SD")
 * @param size - Badge size variant
 * @param showName - Whether to show the full party name alongside the code
 */
export default function PartyBadge({
  parti,
  size = "md",
  showName = false,
}: PartyBadgeProps) {
  const party = PARTIES[parti];
  const bgColor = party?.hex || "#888888";
  const textColor = party?.text || "text-white";

  return (
    <span className={cn("inline-flex items-center gap-1.5")}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md font-bold",
          textColor,
          size === "sm" && "text-xs px-1.5 py-0.5 min-w-[28px]",
          size === "md" && "text-sm px-2 py-0.5 min-w-[32px]",
          size === "lg" && "text-base px-2.5 py-1 min-w-[40px]"
        )}
        style={{ backgroundColor: bgColor }}
      >
        {parti}
      </span>
      {showName && party?.name && (
        <span className="text-base-content/70 text-sm">{party.name}</span>
      )}
    </span>
  );
}
