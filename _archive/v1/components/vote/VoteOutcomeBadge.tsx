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

  return (
    <span
      className={cn(
        "inline-flex items-center gap-x-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        outcome === "bifall" &&
          "bg-success/10 text-success inset-ring inset-ring-success/20",
        outcome === "avslag" &&
          "bg-error/10 text-error inset-ring inset-ring-error/20",
        outcome === "lika" &&
          "bg-warning/10 text-warning inset-ring inset-ring-warning/20"
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
