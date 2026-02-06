import { ImageResponse } from "next/og";
import { getDb } from "@/lib/db";
import { COMMITTEE_MAP, SLUG_TO_COMMITTEE } from "@/lib/constants";

export const runtime = "edge";
export const alt = "Ämne i riksdagen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generates a dynamic OG image for a topic/committee page.
 * Shows committee name, description, and vote count.
 */
export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const code = SLUG_TO_COMMITTEE[slug];
  const committee = code ? COMMITTEE_MAP[code] : null;

  if (!committee) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fafafa",
            fontSize: "48px",
          }}
        >
          Ämne hittades inte
        </div>
      ),
      { ...size }
    );
  }

  const sql = getDb();

  // Get vote count for this committee
  const countRows = await sql`
    SELECT COUNT(*) as count FROM voting_events WHERE organ = ${code}
  ` as { count: number }[];
  const voteCount = Number(countRows[0]?.count) || 0;

  // Get some stats
  const statsRows = await sql`
    SELECT
      SUM(ja) as ja,
      SUM(nej) as nej
    FROM voting_events
    WHERE organ = ${code}
  ` as { ja: number; nej: number }[];

  const stats = statsRows[0];
  const bifallCount = Number(stats?.ja || 0) > Number(stats?.nej || 0) ? "Majoritet bifall" : "Majoritet avslag";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* Icon placeholder */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "16px",
              background: "rgba(37, 99, 235, 0.2)",
              color: "#3b82f6",
              fontSize: "40px",
            }}
          >
            {committee.name.charAt(0)}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "20px", color: "#71717a" }}>Utskott / Ämne</span>
            <span style={{ fontSize: "56px", fontWeight: "bold", color: "#fafafa" }}>
              {committee.name}
            </span>
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: "28px",
            color: "#a1a1aa",
            marginTop: "24px",
            lineHeight: "1.4",
          }}
        >
          {committee.description}
        </p>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "60px",
            marginTop: "auto",
            padding: "32px 40px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "48px", fontWeight: "bold", color: "#3b82f6" }}>
              {voteCount.toLocaleString("sv-SE")}
            </span>
            <span style={{ fontSize: "18px", color: "#71717a" }}>Voteringar</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "48px", fontWeight: "bold", color: "#22c55e" }}>
              {Number(stats?.ja || 0).toLocaleString("sv-SE")}
            </span>
            <span style={{ fontSize: "18px", color: "#71717a" }}>Totalt Ja</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "48px", fontWeight: "bold", color: "#ef4444" }}>
              {Number(stats?.nej || 0).toLocaleString("sv-SE")}
            </span>
            <span style={{ fontSize: "18px", color: "#71717a" }}>Totalt Nej</span>
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            position: "absolute",
            bottom: "30px",
            right: "60px",
            fontSize: "18px",
            color: "#52525b",
          }}
        >
          riksdagsrosten.se
        </p>
      </div>
    ),
    { ...size }
  );
}
