type Window = { count: number; resetsAt: number };
const windows = new Map<string, Window>();

export function allowJoin(key: string, now = Date.now()): boolean {
  const current = windows.get(key);
  const window = current && current.resetsAt > now ? current : { count: 0, resetsAt: now + 60 * 60 * 1000 };
  window.count += 1;
  windows.set(key, window);
  return window.count <= 8;
}
