import type { Metadata } from "next";
import { Manrope, Newsreader, Ubuntu } from "next/font/google";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const serif = Newsreader({ subsets: ["latin"], variable: "--font-newsreader" });
const display = Ubuntu({ subsets: ["latin"], weight: "700", variable: "--font-ubuntu" });

export const metadata: Metadata = {
  title: "Kinja — Join the waitlist",
  description: "Kinja records a crop from the farmer to the customer. Join the waitlist to start a hub.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${display.variable} h-full`}>
      <body className="min-h-full bg-white font-sans text-[#24382c] antialiased">{children}</body>
    </html>
  );
}
