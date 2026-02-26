import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "TBGC — Wholesale Truffles, Caviar & Specialty Foods"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundColor: "#F9F7F4",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "80px",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Dark accent bar top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: "#0A0A0A",
            display: "flex",
          }}
        />

        {/* Large decorative text — top right */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "80px",
            fontSize: "200px",
            color: "#E5E1DB",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            lineHeight: 1,
            display: "flex",
          }}
        >
          ✦
        </div>

        {/* Eyebrow */}
        <div
          style={{
            fontSize: "14px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#C8C0B4",
            marginBottom: "20px",
            display: "flex",
          }}
        >
          Wholesale · Los Angeles · Since 2020
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: "400",
            color: "#0A0A0A",
            fontFamily: "Georgia, serif",
            lineHeight: 1.05,
            marginBottom: "24px",
            maxWidth: "780px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Truffles. Caviar.</span>
          <span>The Rare Stuff.</span>
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: "22px",
            color: "#71717a",
            maxWidth: "620px",
            lineHeight: 1.5,
            marginBottom: "48px",
            display: "flex",
          }}
        >
          122+ premium SKUs for Michelin kitchens — same-day SoCal, 24-48hr nationwide.
        </div>

        {/* Domain pill */}
        <div
          style={{
            backgroundColor: "#0A0A0A",
            color: "#F9F7F4",
            fontSize: "16px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "12px 24px",
            display: "flex",
          }}
        >
          truffleboys.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
