import type { TradeoffQuadrantId } from "@/lib/route2";

/**
 * Geometry of Exercise 2's trade-off quadrant map, shared by the live
 * exercise and (via the same coordinates) any future export rendering.
 *
 * x = cost (low left → high right)
 * y = friction (low bottom → high top)
 */
export const TMAP = { w: 380, h: 300, x0: 46, x1: 366, y0: 12, y1: 252 } as const;

export const TMID_X = (TMAP.x0 + TMAP.x1) / 2;
export const TMID_Y = (TMAP.y0 + TMAP.y1) / 2;

export function tradeoffQuadrantRect(q: TradeoffQuadrantId) {
  const left = q === "friction" || q === "notReal";
  const top = q === "friction" || q === "board";
  return {
    x: left ? TMAP.x0 : TMID_X,
    y: top ? TMAP.y0 : TMID_Y,
    w: (TMAP.x1 - TMAP.x0) / 2,
    h: (TMAP.y1 - TMAP.y0) / 2,
  };
}

/** Where the n-th of `count` pairs sharing a quadrant sits. */
export function tradeoffSlotPosition(q: TradeoffQuadrantId, index: number, count: number) {
  const r = tradeoffQuadrantRect(q);
  const spread = 40;
  return {
    x: r.x + r.w / 2 + (index - (count - 1) / 2) * spread,
    y: r.y + r.h / 2 + 10,
  };
}
