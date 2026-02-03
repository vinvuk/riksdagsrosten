interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
}

/**
 * A single stat display card with a large value and descriptive label.
 * @param label - The stat description (e.g. "Voteringar")
 * @param value - The stat value (e.g. "1 234")
 * @param sublabel - Optional secondary label
 */
export default function StatCard({ label, value, sublabel }: StatCardProps) {
  return (
    <div className="bg-base-100 rounded-lg border border-base-200 px-4 py-5 sm:p-6">
      <dt className="text-sm font-medium text-base-content/60 truncate">
        {label}
      </dt>
      <dd className="mt-1 text-3xl font-bold tracking-tight text-base-content">
        {typeof value === "number" ? value.toLocaleString("sv-SE") : value}
      </dd>
      {sublabel && (
        <dd className="mt-1 text-sm text-base-content/50">{sublabel}</dd>
      )}
    </div>
  );
}
