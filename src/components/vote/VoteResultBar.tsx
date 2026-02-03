import { cn } from "@/lib/utils";

interface VoteResultBarProps {
  ja: number;
  nej: number;
  avstar: number;
  franvarande: number;
  showLabels?: boolean;
  height?: "sm" | "md" | "lg";
}

/**
 * Horizontal stacked bar showing vote distribution: Ja (green) / Nej (red) / Avstår (yellow) / Frånvarande (gray).
 * @param ja - Number of yes votes
 * @param nej - Number of no votes
 * @param avstar - Number of abstentions
 * @param franvarande - Number of absent
 * @param showLabels - Show count labels below the bar
 * @param height - Bar height variant
 */
export default function VoteResultBar({
  ja,
  nej,
  avstar,
  franvarande,
  showLabels = false,
  height = "md",
}: VoteResultBarProps) {
  const total = ja + nej + avstar + franvarande;
  if (total === 0) return null;

  const pctJa = (ja / total) * 100;
  const pctNej = (nej / total) * 100;
  const pctAvstar = (avstar / total) * 100;
  const pctFranv = (franvarande / total) * 100;

  return (
    <div>
      <div
        className={cn(
          "flex w-full rounded-full overflow-hidden",
          height === "sm" && "h-2",
          height === "md" && "h-3",
          height === "lg" && "h-5"
        )}
      >
        {pctJa > 0 && (
          <div
            className="bg-success"
            style={{ width: `${pctJa}%` }}
            title={`Ja: ${ja}`}
          />
        )}
        {pctNej > 0 && (
          <div
            className="bg-error"
            style={{ width: `${pctNej}%` }}
            title={`Nej: ${nej}`}
          />
        )}
        {pctAvstar > 0 && (
          <div
            className="bg-warning"
            style={{ width: `${pctAvstar}%` }}
            title={`Avstår: ${avstar}`}
          />
        )}
        {pctFranv > 0 && (
          <div
            className="bg-base-300"
            style={{ width: `${pctFranv}%` }}
            title={`Frånvarande: ${franvarande}`}
          />
        )}
      </div>
      {showLabels && (
        <div className="flex justify-between mt-1 text-xs text-base-content/60">
          <span className="text-success font-medium">Ja {ja}</span>
          <span className="text-error font-medium">Nej {nej}</span>
          <span className="text-warning font-medium">Avstår {avstar}</span>
          <span className="text-base-content/40">Frånv. {franvarande}</span>
        </div>
      )}
    </div>
  );
}
