import { cn } from "@/lib/utils";

interface VoteOutcomeBadgeProps {
  ja: number;
  nej: number;
}

/**
 * Badge showing the outcome of a vote: Bifall (passed), Avslag (rejected), or Lika (tied).
 * Adapted from Tailwind Plus "Narrow with badges" status dot pattern.
 * @param ja - Number of yes votes
 * @param nej - Number of no votes
 */
export default function VoteOutcomeBadge({ ja, nej }: VoteOutcomeBadgeProps) {
  const outcome = ja > nej ? "bifall" : nej > ja ? "avslag" : "lika";

  const titles: Record<string, string> = {
    bifall: "Förslaget bifölls — fler röstade ja än nej",
    avslag: "Förslaget avslogs — fler röstade nej än ja",
    lika: "Lika antal ja- och nej-röster",
  };

  return (
    <span
      title={titles[outcome]}
      className={cn(
        "inline-flex items-center gap-x-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        outcome === "bifall" &&
          "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
        outcome === "avslag" &&
          "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-400",
        outcome === "lika" &&
          "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400"
      )}
    >
      <svg
        viewBox="0 0 6 6"
        aria-hidden="true"
        className="size-1.5 fill-current"
      >
        <circle r={3} cx={3} cy={3} />
      </svg>
      {outcome === "bifall" && "Bifall"}
      {outcome === "avslag" && "Avslag"}
      {outcome === "lika" && "Lika"}
    </span>
  );
}
