import { ImageResponse } from "next/og";

export const alt = "Halte.ui — Interactive Transjakarta BRT Transit Map";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STOP_DOTS = [
  { x: 40, y: 60, s: 16, color: "#E4002B", o: 0.8 },
  { x: 120, y: 40, s: 10, color: "#E4002B", o: 0.4 },
  { x: 200, y: 70, s: 12, color: "#0057A8", o: 0.6 },
  { x: 290, y: 50, s: 8, color: "#00A650", o: 0.5 },
  { x: 370, y: 75, s: 14, color: "#0057A8", o: 0.7 },
  { x: 70, y: 160, s: 10, color: "#00A650", o: 0.6 },
  { x: 160, y: 140, s: 14, color: "#E4002B", o: 0.7 },
  { x: 250, y: 170, s: 16, color: "#F47920", o: 0.8 },
  { x: 330, y: 145, s: 8, color: "#E4002B", o: 0.4 },
  { x: 410, y: 160, s: 12, color: "#00A650", o: 0.6 },
  { x: 45, y: 260, s: 12, color: "#0057A8", o: 0.7 },
  { x: 135, y: 240, s: 8, color: "#F47920", o: 0.5 },
  { x: 220, y: 270, s: 10, color: "#E4002B", o: 0.6 },
  { x: 300, y: 250, s: 14, color: "#8C3B80", o: 0.7 },
  { x: 390, y: 265, s: 10, color: "#0057A8", o: 0.5 },
  { x: 80, y: 360, s: 14, color: "#F47920", o: 0.7 },
  { x: 170, y: 340, s: 10, color: "#E4002B", o: 0.6 },
  { x: 255, y: 370, s: 8, color: "#0057A8", o: 0.5 },
  { x: 345, y: 350, s: 12, color: "#00A650", o: 0.7 },
  { x: 425, y: 365, s: 16, color: "#E4002B", o: 0.8 },
  { x: 55, y: 460, s: 10, color: "#8C3B80", o: 0.6 },
  { x: 145, y: 440, s: 14, color: "#0057A8", o: 0.7 },
  { x: 235, y: 470, s: 12, color: "#F47920", o: 0.6 },
  { x: 315, y: 450, s: 8, color: "#E4002B", o: 0.5 },
  { x: 400, y: 465, s: 10, color: "#00A650", o: 0.6 },
  { x: 90, y: 560, s: 8, color: "#E4002B", o: 0.35 },
  { x: 180, y: 540, s: 12, color: "#8C3B80", o: 0.45 },
  { x: 270, y: 570, s: 10, color: "#0057A8", o: 0.55 },
  { x: 360, y: 555, s: 14, color: "#F47920", o: 0.65 },
  { x: 435, y: 575, s: 8, color: "#E4002B", o: 0.35 },
] as const;

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#0D0D0D",
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Left red accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 6,
          height: "100%",
          background: "#E4002B",
        }}
      />

      {/* Right decorative panel — abstract transit network */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 480,
          height: "100%",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Gradient fade to the left so it blends with content */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "55%",
            height: "100%",
            backgroundImage: "linear-gradient(to right, #0D0D0D, transparent)",
            zIndex: 1,
          }}
        />

        {/* Stop dots */}
        {STOP_DOTS.map((dot) => (
          <div
            key={`${dot.x}-${dot.y}`}
            style={{
              position: "absolute",
              left: dot.x - dot.s / 2,
              top: dot.y - dot.s / 2,
              width: dot.s,
              height: dot.s,
              borderRadius: "50%",
              background: dot.color,
              opacity: dot.o,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 60px 0 88px",
          zIndex: 2,
          flex: 1,
        }}
      >
        {/* Logo badge row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0A0A0A",
              borderRadius: 12,
              width: 52,
              height: 52,
              border: "1.5px solid #2a2a2a",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Halte.ui</title>
              <path d="M4 6 2 7" />
              <path d="M10 6h4" />
              <path d="m22 7-2-1" />
              <rect width="16" height="16" x="4" y="3" rx="2" />
              <path d="M4 11h16" />
              <path d="M8 15h.01" />
              <path d="M16 15h.01" />
              <path d="M6 19v2" />
              <path d="M18 21v-2" />
            </svg>
          </div>
          <span
            style={{
              color: "#444",
              fontSize: 13,
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            TRANSJAKARTA BRT
          </span>
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: 96,
            fontWeight: "800",
            color: "white",
            letterSpacing: -4,
            lineHeight: 1,
            marginBottom: 24,
            display: "flex",
          }}
        >
          <span>halte</span>
          <span style={{ color: "#888" }}>.ui</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: "#777",
            lineHeight: 1.5,
            maxWidth: 520,
            marginBottom: 48,
          }}
        >
          Interactive transit map for Jakarta's BRT network. Explore routes,
          stops, and schedules.
        </div>

        {/* Feature tags */}
        <div
          style={{
            display: "flex",
            gap: 28,
            alignItems: "center",
          }}
        >
          {(
            [
              { label: "Routes", color: "#E4002B" },
              { label: "Stops", color: "#0057A8" },
              { label: "Schedules", color: "#00A650" },
            ] as const
          ).map((tag) => (
            <div
              key={tag.label}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: tag.color,
                }}
              />
              <span style={{ color: "#555", fontSize: 17 }}>{tag.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
