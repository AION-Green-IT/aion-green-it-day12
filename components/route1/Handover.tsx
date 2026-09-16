"use client";

import clsx from "clsx";
import { HANDOVER } from "@/lib/route1";
import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { ArrowRight } from "@/components/icons/LineIcons";
import { useRoute1, domId } from "./useRoute1";

/**
 * The handover between the two parts (CLAUDE.md #12). It reads the learner's
 * own board back to them — the root-cause and horizon split, drawn as two bars
 * — and turns the question from "what is wrong" into "what gets funded". Never
 * a gate: Part 2 sits directly below and is reachable with the board empty.
 */
export function Handover() {
  const r1 = useRoute1();
  const t = r1.tally;
  const complete = t.triaged === t.total;

  return (
    <section
      id={HANDOVER.id}
      className={clsx(
        "scroll-mt-24 overflow-hidden rounded-2xl border bg-paper shadow-sm transition-colors duration-300",
        complete ? "border-accent/50" : "border-line",
      )}
    >
      <div className="flex items-center gap-3 bg-slate px-5 py-2.5">
        <span className={clsx("h-1.5 w-1.5 rounded-full", complete ? "motif-pulse bg-accent" : "bg-paper/40")} />
        <p className="text-micro font-semibold uppercase tracking-wide text-paper/80">{HANDOVER.kicker}</p>
      </div>

      <div className="space-y-4 p-6">
        <h2 className="text-h2 text-ink">{HANDOVER.heading}</h2>

        <div className={clsx("rounded-xl border px-4 py-3", complete ? "border-accent/30 bg-accentSoft" : "border-line bg-canvas")}>
          <p className="text-micro font-semibold uppercase tracking-wide text-accent">From your own triage</p>
          <p className="mt-1 text-caption text-ink">
            {HANDOVER.tally({ triaged: t.triaged, total: t.total, governance: t.governance, technology: t.technology })}
          </p>
          <SplitBars governance={t.governance} technology={t.technology} />
          <p className="mt-3 text-caption text-ink">{HANDOVER.escalatedNote(r1.escalatedSignals)}</p>
        </div>

        <p className="max-w-prose text-body text-ash">{HANDOVER.body}</p>
        <p className="max-w-prose border-l-4 border-l-accent pl-3 text-caption italic text-ink">{HANDOVER.carry}</p>

        <button type="button" onClick={() => scrollToAndFlash(domId.partTwo, "ref")} className="btn-accent inline-flex items-center gap-2">
          {HANDOVER.cta}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function SplitBars({ governance, technology }: { governance: number; technology: number }) {
  const rows = [
    {
      label: "Root cause",
      left: { value: governance, label: "Missing governance or architecture decision", className: "fill-ink" },
      right: { value: technology, label: "Technology use", className: "fill-ash/60" },
    },
  ];

  return (
    <div className="mt-3 space-y-2.5">
      {rows.map((r) => {
        const total = r.left.value + r.right.value;
        const w = 320;
        const leftW = total === 0 ? 0 : (r.left.value / total) * w;
        return (
          <div key={r.label}>
            <p className="text-micro uppercase tracking-wide text-ash">{r.label}</p>
            <svg
              viewBox={`0 0 ${w} 16`}
              preserveAspectRatio="none"
              role="img"
              aria-label={`${r.label}: ${r.left.value} ${r.left.label}, ${r.right.value} ${r.right.label}`}
              className="mt-1 h-4 w-full"
            >
              <rect x={0} y={0} width={w} height={16} rx={8} className="fill-line" />
              {total > 0 && (
                <>
                  <rect x={0} y={0} width={leftW} height={16} rx={8} className={r.left.className} style={{ transition: "width 400ms ease" }} />
                  <rect
                    x={leftW}
                    y={0}
                    width={w - leftW}
                    height={16}
                    rx={8}
                    className={r.right.className}
                    style={{ transition: "all 400ms ease" }}
                  />
                </>
              )}
            </svg>
            <p className="mt-0.5 flex flex-wrap justify-between gap-x-3 text-micro text-ash">
              <span>
                {r.left.label}: <span className="font-semibold tabular-nums text-ink">{r.left.value}</span>
              </span>
              <span>
                {r.right.label}: <span className="font-semibold tabular-nums text-ink">{r.right.value}</span>
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
