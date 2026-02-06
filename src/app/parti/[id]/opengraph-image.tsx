import { ImageResponse } from "next/og";
import { getDb } from "@/lib/db";
import { PARTIES } from "@/lib/constants";

export const runtime = "edge";
export const alt = "Parti i riksdagen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generates a dynamic OG image for a party page.
 * Shows party name, member count, and vote distribution.
 */
export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partyCode = id.toUpperCase();
  const party = PARTIES[partyCode];

  if (!party) {
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
          Parti hittades inte
        </div>
      ),
      { ...size }
    );
  }

  const sql = getDb();

  // Get member count
  const countRows = await sql`
    SELECT COUNT(*) as count FROM members WHERE parti = ${partyCode}
  ` as { count: number }[];
  const memberCount = Number(countRows[0]?.count) || 0;

  // Get vote stats
  const statsRows = await sql`
    SELECT
      SUM(ja) as ja,
      SUM(nej) as nej,
      SUM(avstar) as avstar,
      SUM(franvarande) as franvarande,
      COUNT(*) as votes
    FROM party_vote_summary
    WHERE parti = ${partyCode}
  ` as { ja: number; nej: number; avstar: number; franvarande: number; votes: number }[];

  const stats = statsRows[0];
  const total = Number(stats?.ja || 0) + Number(stats?.nej || 0) + Number(stats?.avstar || 0) + Number(stats?.franvarande || 0);
  const attendance = total > 0
    ? Math.round(((Number(stats?.ja || 0) + Number(stats?.nej || 0) + Number(stats?.avstar || 0)) / total) * 100)
    : 0;

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
        {/* Top bar with party color */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: party.hex,
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {/* Party badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              borderRadius: "24px",
              background: party.hex,
              color: "white",
              fontSize: "48px",
              fontWeight: "bold",
            }}
          >
            {partyCode}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "20px", color: "#71717a" }}>Riksdagsparti</span>
            <span style={{ fontSize: "64px", fontWeight: "bold", color: "#fafafa" }}>
              {party.name}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "auto",
            padding: "32px 40px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "40px", fontWeight: "bold", color: "#fafafa" }}>
              {memberCount}
            </span>
            <span style={{ fontSize: "16px", color: "#71717a" }}>Ledamöter</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "40px", fontWeight: "bold", color: "#fafafa" }}>
              {Number(stats?.votes || 0).toLocaleString("sv-SE")}
            </span>
            <span style={{ fontSize: "16px", color: "#71717a" }}>Voteringar</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "40px", fontWeight: "bold", color: "#22c55e" }}>
              {Number(stats?.ja || 0).toLocaleString("sv-SE")}
            </span>
            <span style={{ fontSize: "16px", color: "#71717a" }}>Ja-röster</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "40px", fontWeight: "bold", color: "#ef4444" }}>
              {Number(stats?.nej || 0).toLocaleString("sv-SE")}
            </span>
            <span style={{ fontSize: "16px", color: "#71717a" }}>Nej-röster</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "40px", fontWeight: "bold", color: "#3b82f6" }}>
              {attendance}%
            </span>
            <span style={{ fontSize: "16px", color: "#71717a" }}>Närvaro</span>
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
