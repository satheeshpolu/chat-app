const formatCache = new Map<string, string>();

export function formatMessageTime(isoString: string): string {
  const cached = formatCache.get(isoString);
  if (cached) return cached;

  const date = new Date(isoString);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const result = `${day} ${month} ${year} ${hours}:${minutes}`;
  formatCache.set(isoString, result);
  return result;
}
