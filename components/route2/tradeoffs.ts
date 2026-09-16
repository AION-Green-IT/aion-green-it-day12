import { isFactorId, type FactorId, type TradeoffAnswer } from "@/lib/route2";

/**
 * A trade-off pair: the two factors, the "what is given up" note, and the two
 * decide-then-discover diagnostic answers that place it on the quadrant map
 * (Exercise 2). `q1`/`q2` are additive to the original {a,b,note} shape, so a
 * link saved before Phase 3 still parses — it just starts unplaced.
 */
export type TradeOffLink = { a: FactorId; b: FactorId; note: string; q1: TradeoffAnswer | null; q2: TradeoffAnswer | null };

const isAnswer = (v: unknown): v is TradeoffAnswer => v === "yes" || v === "no";

export function parseLinks(raw: string | undefined): TradeOffLink[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(value)) return [];
    return value
      .filter((v): v is Record<string, unknown> => !!v && typeof v === "object")
      .filter((v) => isFactorId(v.a as string) && isFactorId(v.b as string) && typeof v.note === "string")
      .map((v) => ({
        a: v.a as FactorId,
        b: v.b as FactorId,
        note: v.note as string,
        q1: isAnswer(v.q1) ? v.q1 : null,
        q2: isAnswer(v.q2) ? v.q2 : null,
      }));
  } catch {
    return [];
  }
}

export const serialiseLinks = (links: TradeOffLink[]) => JSON.stringify(links);

const samePair = (l: TradeOffLink, a: FactorId, b: FactorId) => (l.a === a && l.b === b) || (l.a === b && l.b === a);

export function addLink(links: TradeOffLink[], a: FactorId, b: FactorId, max: number): TradeOffLink[] {
  if (a === b || links.length >= max || links.some((l) => samePair(l, a, b))) return links;
  return [...links, { a, b, note: "", q1: null, q2: null }];
}

export function removeLink(links: TradeOffLink[], a: FactorId, b: FactorId): TradeOffLink[] {
  return links.filter((l) => !samePair(l, a, b));
}

export function setLinkNote(links: TradeOffLink[], a: FactorId, b: FactorId, note: string): TradeOffLink[] {
  return links.map((l) => (samePair(l, a, b) ? { ...l, note } : l));
}

/** Records one diagnostic answer for a pair — the pair's quadrant is derived from these, never set directly. */
export function setLinkAnswer(links: TradeOffLink[], a: FactorId, b: FactorId, key: "q1" | "q2", value: TradeoffAnswer): TradeOffLink[] {
  return links.map((l) => (samePair(l, a, b) ? { ...l, [key]: value } : l));
}

/** How many links currently touch a given factor — used to grey out an already-touched node. */
export function linksFor(links: TradeOffLink[], id: FactorId): TradeOffLink[] {
  return links.filter((l) => l.a === id || l.b === id);
}
