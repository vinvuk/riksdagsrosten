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
            className="bg-emerald-500 flex items-center justify-center"
            style={{ width: `${pctJa}%` }}
            title={`Ja: ${ja}`}
          >
            {isLg && pctJa > 15 && (
              <span className="text-[10px] font-bold text-white">
                {Math.round(pctJa)}%
              </span>
            )}
          </div>
        )}
        {pctNej > 0 && (
          <div
            className="bg-red-500 flex items-center justify-center"
            style={{ width: `${pctNej}%` }}
            title={`Nej: ${nej}`}
          >
            {isLg && pctNej > 15 && (
              <span className="text-[10px] font-bold text-white">
                {Math.round(pctNej)}%
              </span>
            )}
          </div>
        )}
        {pctAvstar > 0 && (
          <div
            className="bg-amber-400 flex items-center justify-center"
            style={{ width: `${pctAvstar}%` }}
            title={`Avstår: ${avstar}`}
          >
            {isLg && pctAvstar > 15 && (
              <span className="text-[10px] font-bold text-amber-900">
                {Math.round(pctAvstar)}%
              </span>
            )}
          </div>
        )}
        {pctFranv > 0 && (
          <div
            className="bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center"
            style={{ width: `${pctFranv}%` }}
            title={`Frånvarande: ${franvarande}`}
          >
            {isLg && pctFranv > 15 && (
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                {Math.round(pctFranv)}%
              </span>
            )}
          </div>
        )}
      </div>
      {showLabels && (
        <div className="flex flex-wrap items-center gap-x-1 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Ja {ja} ({Math.round(pctJa)}%)
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">&middot;</span>
          <span className="text-red-600 dark:text-red-400 font-medium">
            Nej {nej} ({Math.round(pctNej)}%)
          </span>
          {avstar > 0 && (
            <>
              <span className="text-zinc-400 dark:text-zinc-500">&middot;</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Avstår {avstar}
              </span>
            </>
          )}
          {franvarande > 0 && (
            <>
              <span className="text-zinc-400 dark:text-zinc-500">&middot;</span>
              <span className="text-zinc-500 dark:text-zinc-400">
                Frånv. {franvarande}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
