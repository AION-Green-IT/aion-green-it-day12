"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/useInView";
import { BUCKETS, CRITERIA, LENS_DEMO, LENS_STATUS, bucketForRank, bucketLabel } from "@/lib/route1";

/** S6 — the lens as a table: definition, diagnostic question, common misuse. */
export function CriteriaTable() {
  return (
    <div className="space-y-2">
      <p className="text-micro font-semibold uppercase tracking-wide text-ash">The seven criteria</p>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead className="bg-mist">
            <tr>
              {["Criterion", "Definition", "Diagnostic question", "Common misuse"].map((h) => (
                <th key={h} className="px-3 py-2 text-micro font-semibold uppercase tracking-wide text-ash">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c) => (
              <tr key={c.id} className="border-t border-line align-top">
                <td className="px-3 py-2 text-caption font-semibold text-ink">{c.name}</td>
                <td className="px-3 py-2 text-caption text-ash">{c.definition}</td>
                <td className="px-3 py-2 text-caption italic text-ink">&ldquo;{c.question}&rdquo;</td>
                <td className="px-3 py-2 text-caption text-ash">{c.misuse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rounded-lg border border-warn/40 bg-warn/5 px-3 py-2 text-micro text-ink">{LENS_STATUS}</p>
    </div>
  );
}

const ROW_H = 40;
const TOP_PAD = 14;
const VIEW_W = 440;
const LABEL_W = 132;
const BAR_X = 140;
const BAR_W = VIEW_W - BAR_X - 10;
const SEG_GAP = 5;
const SEG_W = (BAR_W - 2 * SEG_GAP) / 3;
const SEG_H = 26;
const VIEW_H = TOP_PAD * 2 + CRITERIA.length * ROW_H;

/**
 * SVG #10 — The Lens Grid: the empty seven-row bucket strip the learner fills
 * in Part 2, with a short demo that profiles one illustrative option in
 * Low/Mid/High and then clears itself. Plays once when scrolled into view;
 * replayable.
 */
export function LensRadar() {
  const { ref, seen } = useInView<HTMLDivElement>(0.4);
  const [phase, setPhase] = useState<"empty" | "drawn" | "cleared">("empty");
  const timers = useRef<number[]>([]);
  const played = useRef(false);

  const play = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setPhase("empty");
    timers.current = [
      window.setTimeout(() => setPhase("drawn"), 250),
      window.setTimeout(() => setPhase("cleared"), 3600),
    ];
  };

  useEffect(() => {
    if (seen && !played.current) {
      played.current = true;
      play();
    }
  }, [seen]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const drawn = phase === "drawn";

  return (
    <div ref={ref} className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
      <div className="mx-auto w-full max-w-[440px]">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="The Lens Grid: seven criteria, each profiled Low, Mid or High"
          className="h-auto w-full"
        >
          <title>The Lens Grid: seven criteria, each profiled Low, Mid or High</title>
          {CRITERIA.map((c, i) => {
            const y = TOP_PAD + i * ROW_H;
            const bucket = bucketForRank(LENS_DEMO.ranks[c.id]);
            return (
              <g key={c.id}>
                <text x={0} y={y + SEG_H / 2 + 4} className="fill-ash" style={{ fontSize: 12, fontWeight: 600 }}>
                  {c.axis}
                </text>
                {BUCKETS.map((b, bi) => {
                  const x = BAR_X + bi * (SEG_W + SEG_GAP);
                  const active = drawn && bucket === b.id;
                  return (
                    <g
                      key={b.id}
                      style={{
                        transition: "opacity 400ms ease, transform 400ms ease",
                        transitionDelay: `${i * 90}ms`,
                        opacity: drawn ? 1 : b.id === "low" ? 1 : 0.35,
                        transformOrigin: `${x + SEG_W / 2}px ${y + SEG_H / 2}px`,
                        transform: active ? "scale(1.06)" : "scale(1)",
                      }}
                    >
                      <rect
                        x={x}
                        y={y}
                        width={SEG_W}
                        height={SEG_H}
                        rx={6}
                        className={clsx(active ? "fill-accentSoft stroke-accent" : "fill-canvas stroke-line")}
                        strokeWidth={active ? 1.8 : 1}
                      />
                      <text
                        x={x + SEG_W / 2}
                        y={y + SEG_H / 2 + 4}
                        textAnchor="middle"
                        className={active ? "fill-accent" : "fill-ash"}
                        style={{ fontSize: 11, fontWeight: 700 }}
                      >
                        {b.letter}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="space-y-2 rounded-xl border border-line bg-canvas p-4">
        <p className="text-caption font-semibold text-ink">The tool you fill in Part 2</p>
        <p className="text-caption text-ash">
          Each option gets a bucket — Low, Mid or High — on each criterion. Tap a cell in Part 2 to cycle through them.
        </p>
        <p aria-live="polite" className="flex items-center gap-2 text-micro text-ash">
          <span
            className={clsx(
              "inline-flex h-4 w-4 items-center justify-center rounded border",
              drawn ? "border-accent bg-accentSoft" : "border-line bg-canvas",
            )}
            aria-hidden="true"
          />
          {phase === "drawn"
            ? `${LENS_DEMO.label} — mostly ${bucketLabel(bucketForRank(LENS_DEMO.ranks.leverage)).toLowerCase()} on leverage`
            : phase === "cleared"
              ? "Demo cleared — the grid starts empty in Part 2."
              : "Empty grid."}
        </p>
        <p className="text-micro text-ash">{LENS_DEMO.note}</p>
        <button type="button" onClick={play} className="btn-ghost">
          Play the demo again
        </button>
      </div>
    </div>
  );
}
