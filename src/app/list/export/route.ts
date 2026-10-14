import { isAdmin } from "@/auth/current";
import { getStore } from "@/db/store";
import { entriesToCsv } from "@/waitlist/csv";

export async function GET() {
  if (!(await isAdmin())) return new Response("Sign in to export the list.", { status: 401 });
  const csv = entriesToCsv(await getStore().list());
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"kinja-waitlist.csv\"",
      "Cache-Control": "no-store",
    },
  });
}
