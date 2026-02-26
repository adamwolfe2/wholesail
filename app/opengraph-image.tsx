import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Wholesail — Custom B2B Wholesale Ordering Portals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#F5F3EE",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "#2A52BE",
          }}
        />

        {/* Logo / Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#2A52BE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
              fontWeight: 700,
              fontFamily: "monospace",
            }}
          >
            W
          </div>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "20px",
              letterSpacing: "0.15em",
              color: "#8B92A5",
              textTransform: "uppercase",
            }}
          >
            Wholesail
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 400,
            color: "#0F1523",
            lineHeight: 1.15,
            marginBottom: "24px",
            maxWidth: "900px",
          }}
        >
          Custom B2B Wholesale Ordering Portals
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: "22px",
            color: "#3D4556",
            lineHeight: 1.5,
            maxWidth: "700px",
          }}
        >
          Client portal, admin panel, SMS ordering, Stripe billing, inventory management. Live in under 2 weeks.
        </div>

        {/* Bottom stats bar */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "48px",
            paddingTop: "32px",
            borderTop: "1px solid #C8C3BB",
          }}
        >
          {[
            { value: "34+", label: "Features" },
            { value: "<2 wk", label: "To Launch" },
            { value: "$25K", label: "One-Time Build" },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#2A52BE",
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "13px",
                  color: "#8B92A5",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
