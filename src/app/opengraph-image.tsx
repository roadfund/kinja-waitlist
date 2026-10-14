import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";

export const alt = "Kinja: every handoff, from the farm to the sale. Get early access.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const colors = { night: "#24382c", cream: "#f7f4ec", gold: "#e8b44d" } as const;
const headline = ["Every handoff,", "from the farm", "to the sale."];
const tagline = "The operating system for Africa's agricultural value chains.";
const cta = "Get early access →";

// Small copies of the hero photos live in ./_og so the image stays light enough for WhatsApp previews.
const photos = [
  { file: "pexels-achor-david-926249768-34705723.jpg", rotate: -9, x: 0, y: 46 },
  { file: "ali-mkumbwa-XzgW_vYpm8M-unsplash.jpg", rotate: 9, x: 236, y: 46 },
  { file: "pexels-droneafrica-30534343.jpg", rotate: 0, x: 118, y: 0 },
];

async function photo(file: string): Promise<string> {
  const data = await readFile(join(process.cwd(), "src/app/_og", file));
  return `data:image/jpeg;base64,${data.toString("base64")}`;
}

// Google Fonts serves TrueType when no browser user agent is sent, which ImageResponse can read.
async function ubuntu(weight: 400 | 700, text: string): Promise<string> {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Ubuntu:wght@${weight}&text=${encodeURIComponent(text)}`)).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error("Could not load the Ubuntu font for the share image.");
  return Buffer.from(await (await fetch(url)).arrayBuffer()).toString("base64");
}

// Cached so the image is built once at build time, not on every share preview request.
async function assets() {
  "use cache";
  cacheLife("max");
  const [bold, regular, ...images] = await Promise.all([
    ubuntu(700, `kinja.${headline.join("")}${cta}`),
    ubuntu(400, tagline),
    ...photos.map((item) => photo(item.file)),
  ]);
  return { bold, regular, images };
}

export default async function Image() {
  const { bold, regular, images } = await assets();

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: colors.night, color: colors.cream, fontFamily: "Ubuntu", padding: "64px 72px" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            kinja<span style={{ color: colors.gold }}>.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {headline.map((line) => (
              <div key={line} style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2 }}>{line}</div>
            ))}
            <div style={{ display: "flex", maxWidth: 520, marginTop: 24, fontSize: 26, fontWeight: 400, color: "rgba(247,244,236,0.72)" }}>{tagline}</div>
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", background: colors.gold, color: colors.night, fontSize: 26, fontWeight: 700, padding: "16px 32px", borderRadius: 999 }}>{cta}</div>
          </div>
        </div>
        <div style={{ display: "flex", position: "relative", flex: 1, marginTop: 70 }}>
          {photos.map((item, index) => (
            <div
              key={item.file}
              style={{ display: "flex", position: "absolute", left: item.x, top: item.y, width: 200, height: 280, borderRadius: 28, border: `7px solid ${colors.cream}`, overflow: "hidden", transform: `rotate(${item.rotate}deg)`, boxShadow: "0 24px 48px rgba(0,0,0,0.35)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img elements */}
              <img src={images[index]} alt="" width={200} height={280} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Ubuntu", data: Buffer.from(bold, "base64"), weight: 700, style: "normal" },
        { name: "Ubuntu", data: Buffer.from(regular, "base64"), weight: 400, style: "normal" },
      ],
    },
  );
}
