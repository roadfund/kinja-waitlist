import { connection } from "next/server";
import { getStore } from "@/db/store";

const shown = 5;

function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(seed)}&backgroundColor=f7f4ec,e4e7e2,f3e3bd`;
}

// Seeds come from random entry ids, so no names or emails leave the server.
export async function SignupAvatars() {
  await connection();
  const store = getStore();
  const total = store.count();
  if (total === 0) return null;
  const ids = store.recentIds(shown);
  const label = total === 1 ? "1 person has joined" : `${total.toLocaleString("en")} people have joined`;

  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <div className="flex -space-x-2" aria-hidden="true">
        {ids.map((id) => (
          // eslint-disable-next-line @next/next/no-img-element -- remote SVG avatars; next/image would need dangerouslyAllowSVG
          <img className="h-8 w-8 rounded-full border-2 border-white bg-cream" key={id} src={avatarUrl(id)} alt="" width={32} height={32} loading="lazy" />
        ))}
      </div>
      <p className="text-sm font-medium text-muted">{label}</p>
    </div>
  );
}
