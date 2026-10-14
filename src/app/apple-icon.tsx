import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same mark as icon.svg, drawn at the size iOS uses for home-screen icons.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#24382c" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path d="M19 14h7v20l10-11h9L34.5 34 46 50h-8.5l-8-11.5L26 42v8h-7z" fill="#f7f4ec" />
          <circle cx="50" cy="46.5" r="4.5" fill="#e8b44d" />
        </svg>
      </div>
    ),
    size,
  );
}
