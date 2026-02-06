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
 * For lg height, percentages are rendered inside bar segments when wide enough.
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

  const ariaText = `Ja ${ja}, Nej ${nej}, Avstår ${avstar}, Frånvarande ${franvarande}`;
  const isLg = height === "lg";

  return (
    <div>
      <div
        role="img"
        aria-label={ariaText}
        className={cn(
          "flex w-full rounded-full overflow-hidden",
          height === "sm" && "h-2",
          height === "md" && "h-3",
          isLg && "h-6"
        )}
      >
        {pctJa > 0 && (
          <div
            className="bg-success flex items-center justify-center"
            style={{ width: `${pctJa}%` }}
            title={`Ja: ${ja}`}
          >
            {isLg && pctJa > 15 && (
              <span className="text-[10px] font-bold text-success-content">
                {Math.round(pctJa)}%
              </span>
            )}
          </div>
        )}
        {pctNej > 0 && (
          <div
            className="bg-error flex items-center justify-center"
            style={{ width: `${pctNej}%` }}
            title={`Nej: ${nej}`}
          >
            {isLg && pctNej > 15 && (
              <span className="text-[10px] font-bold text-error-content">
                {Math.round(pctNej)}%
              </span>
            )}
          </div>
        )}
        {pctAvstar > 0 && (
          <div
            className="bg-warning flex items-center justify-center"
            style={{ width: `${pctAvstar}%` }}
            title={`Avstår: ${avstar}`}
          >
            {isLg && pctAvstar > 15 && (
              <span className="text-[10px] font-bold text-warning-content">
                {Math.round(pctAvstar)}%
              </span>
            )}
          </div>
        )}
        {pctFranv > 0 && (
          <div
            className="bg-base-300 flex items-center justify-center"
            style={{ width: `${pctFranv}%` }}
            title={`Frånvarande: ${franvarande}`}
          >
            {isLg && pctFranv > 15 && (
              <span className="text-[10px] font-bold text-base-content/60">
                {Math.round(pctFranv)}%
              </span>
            )}
          </div>
        )}
      </div>
      {showLabels && (
        <div className="flex flex-wrap items-center gap-x-1 mt-1.5 text-xs text-base-content/70">
          <span className="text-success font-medium">
            Ja {ja} ({Math.round(pctJa)}%)
          </span>
          <span className="text-base-content/30">&middot;</span>
          <span className="text-error font-medium">
            Nej {nej} ({Math.round(pctNej)}%)
          </span>
          {avstar > 0 && (
            <>
              <span className="text-base-content/30">&middot;</span>
              <span className="text-warning font-medium">Avstår {avstar}</span>
            </>
          )}
          {franvarande > 0 && (
            <>
              <span className="text-base-content/30">&middot;</span>
              <span className="text-base-content/60">
                Frånv. {franvarande}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
