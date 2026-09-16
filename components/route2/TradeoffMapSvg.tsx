"use client";

import { TRADEOFF_QUADRANTS } from "@/lib/route2";
import { TMAP, TMID_X, TMID_Y, tradeoffQuadrantRect, tradeoffSlotPosition } from "./tradeoffMapLayout";
import type { TradeoffPairState } from "./useRoute2";

/**
 * The 2×2 trade-off quadrant map (replaces the ring-link picker). A pair
 * appears on it only once both diagnostic questions are answered, then
 * slides into the quadrant those two answers imply — the position is a
 * consequence, never a drop target, same as day11's TradeoffMapSvg.
 */
export function TradeoffMapSvg({ states, compact = false }: { states: TradeoffPairState[]; compact?: boolean }) {
  const labelSize = compact ? 11.5 : 12.5;

  return (
    <svg
      viewBox={`0 0 ${TMAP.w} ${TMAP.h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Trade-off map: cost against friction"
      className="h-auto w-full"
    >
      <title>Trade-off map</title>

      {TRADEOFF_QUADRANTS.map((q) => {
        const r = tradeoffQuadrantRect(q.id);
        const warm = q.id === "board" || q.id === "internal";
        return (
          <g key={q.id}>
            <rect
              x={r.x + 2}
              y={r.y + 2}
              width={r.w - 4}
              height={r.h - 4}
              rx={10}
              className={warm ? "fill-accentSoft stroke-accent/30" : "fill-mist stroke-line"}
              strokeWidth={1.4}
            />
            <text x={r.x + 10} y={r.y + 20} className={warm ? "fill-accent" : "fill-ash"} style={{ fontSize: labelSize, fontWeight: 700 }}>
              {q.label}
            </text>
          </g>
        );
      })}

      {/* Axes */}
      <text x={TMAP.x0} y={TMAP.h - 10} className="fill-ash" style={{ fontSize: 11.5 }}>
        low
      </text>
      <text x={TMID_X} y={TMAP.h - 10} textAnchor="middle" className="fill-ink" style={{ fontSize: 12, fontWeight: 600 }}>
        Cost →
      </text>
      <text x={TMAP.x1} y={TMAP.h - 10} textAnchor="end" className="fill-ash" style={{ fontSize: 11.5 }}>
        high
      </text>
      <text x={16} y={TMID_Y} textAnchor="middle" transform={`rotate(-90 16 ${TMID_Y})`} className="fill-ink" style={{ fontSize: 12, fontWeight: 600 }}>
        Friction →
      </text>

      {/* Pairs */}
      {states.map((s) => {
        const pos = s.quadrant ? tradeoffSlotPosition(s.quadrant, s.slotIndex, s.slotCount) : { x: TMID_X, y: TMID_Y };
        return (
          <g
            key={`${s.link.a}-${s.link.b}`}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              opacity: s.quadrant ? 1 : 0,
              transition: "transform 550ms cubic-bezier(.2,.8,.2,1), opacity 300ms ease",
            }}
          >
            <circle r={17} className="fill-accent stroke-paper" strokeWidth={2.5} />
            <text y={4} textAnchor="middle" className="fill-paper" style={{ fontSize: 9.5, fontWeight: 700 }}>
              {s.link.a.slice(0, 2).toUpperCase()}·{s.link.b.slice(0, 2).toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
