import { ImageResponse } from "next/og";
import { getDb, convertDates } from "@/lib/db";
import type { VotingEvent } from "@/lib/types";

export const runtime = "edge";
export const alt = "Votering i riksdagen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generates a dynamic OG image for a vote detail page.
 * Shows vote title, outcome, and vote distribution.
 */
export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getDb();

  const rawRows = await sql`
    SELECT ve.*, d.titel
    FROM voting_events ve
    LEFT JOIN documents d ON ve.dok_id = d.dok_id
    WHERE ve.votering_id = ${id}
  `;
  const rows = convertDates(rawRows) as (VotingEvent & { titel: string | null })[];

  const ve = rows[0];
  if (!ve) {
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
          Votering hittades inte
        </div>
      ),
      { ...size }
    );
  }

  const title = ve.rubrik || ve.titel || ve.beteckning;
  const truncatedTitle = title.length > 80 ? title.substring(0, 77) + "..." : title;
  const outcome = ve.ja > ve.nej ? "Bifall" : "Avslag";
  const outcomeColor = ve.ja > ve.nej ? "#22c55e" : "#ef4444";
  const total = ve.ja + ve.nej + ve.avstar + ve.franvarande;
  const jaPercent = total > 0 ? Math.round((ve.ja / total) * 100) : 0;
  const nejPercent = total > 0 ? Math.round((ve.nej / total) * 100) : 0;

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
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "20px", color: "#71717a" }}>Votering</span>
          <span style={{ fontSize: "20px", color: "#52525b" }}>&middot;</span>
          <span style={{ fontSize: "20px", color: "#71717a" }}>{ve.beteckning}</span>
          {ve.datum && (
            <>
              <span style={{ fontSize: "20px", color: "#52525b" }}>&middot;</span>
              <span style={{ fontSize: "20px", color: "#71717a" }}>{ve.datum}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: "#fafafa",
            marginTop: "24px",
            lineHeight: "1.2",
          }}
        >
          {truncatedTitle}
        </h1>

        {/* Outcome badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 24px",
              borderRadius: "12px",
              background: outcomeColor,
              color: "white",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {outcome}
          </div>
        </div>

        {/* Vote bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            gap: "16px",
          }}
        >
          {/* Bar */}
          <div
            style={{
              display: "flex",
              height: "48px",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${jaPercent}%`,
                background: "#22c55e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "20px",
              }}
            >
              {jaPercent > 10 && `${ve.ja}`}
            </div>
            <div
              style={{
                width: `${nejPercent}%`,
                background: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "20px",
              }}
            >
              {nejPercent > 10 && `${ve.nej}`}
            </div>
            <div
              style={{
                flex: 1,
                background: "#3f3f46",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </div>

          {/* Labels */}
          <div style={{ display: "flex", gap: "40px" }}>
            <span style={{ fontSize: "20px", color: "#22c55e", fontWeight: "600" }}>
              Ja: {ve.ja}
            </span>
            <span style={{ fontSize: "20px", color: "#ef4444", fontWeight: "600" }}>
              Nej: {ve.nej}
            </span>
            <span style={{ fontSize: "20px", color: "#f59e0b", fontWeight: "600" }}>
              Avstår: {ve.avstar}
            </span>
            <span style={{ fontSize: "20px", color: "#71717a" }}>
              Frånvarande: {ve.franvarande}
            </span>
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
