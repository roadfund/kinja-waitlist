// The public address of the site, used for share previews and canonical links.
// Set NEXT_PUBLIC_SITE_URL once you have a custom domain; Vercel's production URL is the fallback.
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Kinja",
  url: resolveSiteUrl(),
  title: "Kinja: the operating system for Africa's agricultural value chains",
  description: "Kinja records every purchase and handoff of your produce, from the farmer to the buyer. Join the waitlist for early access.",
} as const;
