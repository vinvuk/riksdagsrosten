import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Riksdagsrösten - Utforska riksdagens voteringar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generates a dynamic OG image for the site.
 * Uses Edge runtime for fast generation.
 */
export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        {/* Swedish flag colors as accent */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "8px",
              background: "#005BBB",
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              width: "60px",
              height: "8px",
              background: "#FFD500",
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              width: "60px",
              height: "8px",
              background: "#005BBB",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            color: "#fafafa",
            textAlign: "center",
            margin: "0",
            lineHeight: "1.1",
          }}
        >
          Riksdagsrösten
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "32px",
            color: "#a1a1aa",
            textAlign: "center",
            margin: "24px 0 0 0",
            maxWidth: "800px",
          }}
        >
          Hur röstade din riksdagsledamot?
        </p>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "60px",
            padding: "24px 48px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: "bold", color: "#22c55e" }}>501</span>
            <span style={{ fontSize: "16px", color: "#71717a" }}>Ledamöter</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: "bold", color: "#3b82f6" }}>1 916</span>
            <span style={{ fontSize: "16px", color: "#71717a" }}>Voteringar</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: "bold", color: "#f59e0b" }}>668k</span>
            <span style={{ fontSize: "16px", color: "#71717a" }}>Röster</span>
          </div>
        </div>

        {/* URL */}
        <p
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "20px",
            color: "#52525b",
          }}
        >
          riksdagsrosten.se
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
