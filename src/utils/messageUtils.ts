import type { Message } from "../types/chat.types";

const tsCache = new Map<string, number>();

function getTime(isoString: string): number {
  let ms = tsCache.get(isoString);
  if (ms === undefined) {
    ms = new Date(isoString).getTime();
    tsCache.set(isoString, ms);
  }
  return ms;
}

export function isConsecutiveMessage(prev: Message, curr: Message): boolean {
  if (prev.author !== curr.author) return false;
  return getTime(curr.timestamp) - getTime(prev.timestamp) < 60_000;
}
