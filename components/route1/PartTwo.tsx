"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { SeriesSwatch } from "@/components/ui/RadarChart";
import { BRIEF, OPTIONS, PART_TWO, materialRefs, type ScoreOption } from "@/lib/route1";
import { PredictionGrid } from "./PredictionGrid";
import { CommitPanel } from "./CommitPanel";
import { OPTION_STYLE } from "./optionStyle";
import { useRoute1, domId } from "./useRoute1";

/**
 * Part 2 — the Decision Scorecard (level 2). The brief once, the three options
 * with their concrete scope, one shared prediction grid (CLAUDE.md #14), then
 * the commit. Matches day11's simpler "predict-then-reveal grid" pattern —
 * no drag-to-rank matrix, no live radar, no free-text reasoning parser.
 */
export function PartTwo() {
  const r1 = useRoute1();

  return (
    <section id={domId.partTwo} className="scroll-mt-24 space-y-6">
      <SectionHeading kicker={`${PART_TWO.tag} · about ${PART_TWO.minutes} minutes`} title={PART_TWO.title} />

      <MaterialRefs refs={materialRefs(["lens", "system", "uncertainty"])} lead="This part draws on" />

      <div className="rounded-2xl border border-line bg-mist p-5">
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">The brief</p>
        {BRIEF.paragraphs.map((p, i) => (
          <p key={i} className={i === 0 ? "mt-1.5 max-w-prose text-body text-ink" : "mt-2 max-w-prose text-body font-semibold text-ink"}>
            {p}
          </p>
        ))}
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {BRIEF.constraints.map((c) => (
            <li key={c} className="rounded-full border border-line bg-paper px-2.5 py-1 text-micro font-semibold text-ash">
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {OPTIONS.map((o) => (
          <OptionCard key={o.id} option={o} />
        ))}
      </div>

      <PredictionGrid />

      <CommitPanel r1={r1} />
    </section>
  );
}

function OptionCard({ option }: { option: ScoreOption }) {
  return (
    <article className="flex flex-col rounded-2xl border border-line bg-paper p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-caption font-bold text-paper">{option.id}</span>
        <SeriesSwatch style={OPTION_STYLE[option.id]} />
        <span className="text-micro font-semibold uppercase tracking-wide text-ash">{option.short}</span>
      </div>
      <p className="mt-2 text-caption font-semibold text-ink">{option.name}</p>
      <details className="mt-3 rounded-lg border border-line bg-canvas px-3 py-2">
        <summary className="cursor-pointer text-micro font-semibold text-accent">{PART_TWO.meansLabel}</summary>
        <ul className="mt-2 space-y-1.5">
          {option.means.map((m) => (
            <li key={m} className="flex gap-2 text-caption text-ash">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ash" />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </details>
      <MaterialRefs refs={materialRefs(option.material)} />
    </article>
  );
}
