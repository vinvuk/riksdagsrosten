import { ImageResponse } from "next/og";
import { getDb } from "@/lib/db";
import { PARTIES } from "@/lib/constants";
import type { Member } from "@/lib/types";

export const runtime = "edge";
export const alt = "Riksdagsledamot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generates a dynamic OG image for a member page.
 * Shows member name, party, constituency, and vote stats.
 */
export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getDb();

  const members = await sql`
    SELECT tilltalsnamn, efternamn, parti, valkrets FROM members WHERE intressent_id = ${id}
  ` as Pick<Member, "tilltalsnamn" | "efternamn" | "parti" | "valkrets">[];

  const member = members[0];
  if (!member) {
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
          Ledamot hittades inte
        </div>
      ),
      { ...size }
    );
  }

  const party = PARTIES[member.parti];
  const partyColor = party?.hex || "#71717a";

  // Get vote stats
  const statsRows = await sql`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN rost = 'Ja' THEN 1 ELSE 0 END) as ja,
      SUM(CASE WHEN rost = 'Nej' THEN 1 ELSE 0 END) as nej,
      SUM(CASE WHEN rost = 'Frånvarande' THEN 1 ELSE 0 END) as franvarande
    FROM votes
    WHERE intressent_id = ${id}
  ` as { total: number; ja: number; nej: number; franvarande: number }[];

  const stats = statsRows[0];
  const attendance = stats && Number(stats.total) > 0
    ? Math.round(((Number(stats.total) - Number(stats.franvarande)) / Number(stats.total)) * 100)
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
            background: partyColor,
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* Party badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "16px",
              background: partyColor,
              color: "white",
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            {member.parti}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "20px", color: "#71717a" }}>Riksdagsledamot</span>
            <span style={{ fontSize: "56px", fontWeight: "bold", color: "#fafafa" }}>
              {member.tilltalsnamn} {member.efternamn}
            </span>
          </div>
        </div>

        {/* Party and constituency */}
        <div style={{ display: "flex", gap: "32px", marginTop: "24px" }}>
          <span style={{ fontSize: "24px", color: "#a1a1aa" }}>
            {party?.name || member.parti}
          </span>
          <span style={{ fontSize: "24px", color: "#a1a1aa" }}>
            {member.valkrets}
          </span>
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
              {Number(stats?.total || 0).toLocaleString("sv-SE")}
            </span>
            <span style={{ fontSize: "16px", color: "#71717a" }}>Voteringar</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "40px", fontWeight: "bold", color: "#22c55e" }}>
              {Number(stats?.ja || 0).toLocaleString("sv-SE")}
            </span>
            <span style={{ fontSize: "16px", color: "#71717a" }}>Ja</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "40px", fontWeight: "bold", color: "#ef4444" }}>
              {Number(stats?.nej || 0).toLocaleString("sv-SE")}
            </span>
            <span style={{ fontSize: "16px", color: "#71717a" }}>Nej</span>
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
