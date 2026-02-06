interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
}

/**
 * A single stat display card.
 * Adapted from Tailwind Plus "Simple in cards" stats component.
 * @param label - The stat description (e.g. "Voteringar")
 * @param value - The stat value (e.g. "1 234")
 * @param sublabel - Optional secondary label
 */
export default function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-base-100 px-4 py-5 ring-1 ring-base-300 sm:p-6">
      <dt className="truncate text-sm font-medium text-base-content/60">
        {label}
      </dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-base-content">
        {typeof value === "number" ? value.toLocaleString("sv-SE") : value}
      </dd>
      {sublabel && (
        <dd className="mt-1 text-sm text-base-content/50">{sublabel}</dd>
      )}
    </div>
  );
}
