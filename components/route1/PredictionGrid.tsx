"use client";

import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { Check } from "@/components/icons/LineIcons";
import { AnswerKey } from "@/components/ui/AnswerKey";
import {
  BUCKETS,
  CRITERIA,
  OPTIONS,
  PART_TWO,
  R1,
  bucketForRank,
  bucketLetter,
  criterionAnswerKey,
  criterionCellWhy,
  nextBucket,
  type Bucket,
} from "@/lib/route1";
import { useRoute1, domId } from "./useRoute1";

/**
 * The shared 7×3 prediction grid (CLAUDE.md #14) — one criterion per row, one
 * option per column, one tap per cell to cycle Low → Mid → High → blank.
 * Replaces the drag-to-rank matrix + live radar + free-text reasoning parser:
 * same three options, same seven criteria, same underlying ground truth
 * (`Criterion.expected`, untouched) — just judged as a coarse bucket on a
 * static grid instead of a forced 1-2-3 rank plotted live on a radar.
 *
 * One Reveal action colours every cell at once — one flag, not one per option.
 */
export function PredictionGrid() {
  const r1 = useRoute1();
  const choose = useProgress((s) => s.choose);
  const toggleCheck = useProgress((s) => s.toggleCheck);
  const answerKeyUnlocked = useProgress((s) => s.answerKeyUnlocked);

  const cycle = (criterionId: string, optionId: string, current: Bucket | null) => {
    const next = nextBucket(current);
    choose(R1.predict(optionId, criterionId), next ?? "");
  };

  return (
    <div id={domId.predictGrid} className="scroll-mt-24 space-y-4">
      <div>
        <p className="text-caption font-semibold text-ink">{PART_TWO.predictHeading}</p>
        <p className="mt-0.5 text-micro text-ash">{PART_TWO.predictInstruction}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-paper p-3">
        <table className="w-full min-w-[440px] border-collapse">
          <thead>
            <tr>
              <th className="w-[46%] pb-2 pr-2 text-left text-micro font-semibold uppercase tracking-wide text-ash">
                Criterion
              </th>
              {OPTIONS.map((o) => (
                <th key={o.id} className="pb-2 text-center">
                  <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-micro font-bold text-paper">
                    {o.id}
                  </span>
                  <span className="mt-1 block text-micro font-normal text-ash">
                    {r1.optionStateById(o.id).predictedCount}/{CRITERIA.length}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((c) => (
              <tr key={c.id} className="border-t border-line/70 align-top">
                <td className="py-2 pr-2">
                  <p className="text-caption font-semibold text-ink">{c.name}</p>
                  <p className="mt-0.5 text-micro italic text-ash">{c.question}</p>
                </td>
                {OPTIONS.map((o) => {
                  const state = r1.optionStateById(o.id);
                  const predicted = state.predictions[c.id] ?? null;
                  const actualBucket = bucketForRank(c.expected[o.id]);
                  const showActual = r1.revealedAll;
                  const miss = showActual && predicted !== null && predicted !== actualBucket;
                  const match = showActual && predicted !== null && predicted === actualBucket;
                  return (
                    <td key={o.id} className="py-2 text-center">
                      <button
                        type="button"
                        onClick={() => cycle(c.id, o.id, predicted)}
                        aria-label={`${c.name} — Option ${o.id}: ${
                          predicted ? BUCKETS.find((b) => b.id === predicted)!.label : "not set"
                        }. Click to cycle.`}
                        className={clsx(
                          "mx-auto flex h-9 w-9 items-center justify-center rounded-lg border text-caption font-bold transition-colors duration-150",
                          match
                            ? "border-accent bg-accentSoft text-accent"
                            : miss
                              ? "border-warn/50 bg-warn/10 text-warn"
                              : predicted === "high"
                                ? "border-accent/60 bg-accent/15 text-ink"
                                : predicted === "mid"
                                  ? "border-line bg-mist text-ink"
                                  : predicted === "low"
                                    ? "border-line bg-canvas text-ash"
                                    : "border-dashed border-line bg-paper text-ash hover:border-ash",
                        )}
                      >
                        {bucketLetter(predicted)}
                      </button>
                      {showActual && (
                        <p
                          className={clsx(
                            "mt-1 text-micro font-semibold tabular-nums",
                            predicted === null ? "text-ash" : match ? "text-accent" : "text-warn",
                          )}
                        >
                          model {BUCKETS.find((b) => b.id === actualBucket)!.label}
                        </p>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {answerKeyUnlocked && (
        <details className="rounded-xl border border-warn/40 bg-warn/5 p-3">
          <summary className="cursor-pointer text-micro font-semibold uppercase tracking-wide text-warn">
            Mentor answer keys — all seven criteria
          </summary>
          <div className="mt-2 space-y-2">
            {CRITERIA.map((c) => (
              <AnswerKey key={c.id} block={criterionAnswerKey(c)} />
            ))}
          </div>
        </details>
      )}

      <div id={domId.revealAction} className="scroll-mt-24">
        {r1.revealedAll ? (
          <p className="inline-flex items-center gap-1.5 text-caption font-semibold text-accent">
            <Check className="h-4 w-4" />
            {PART_TWO.revealedLabel}
          </p>
        ) : (
          <button type="button" onClick={() => toggleCheck(R1.revealed, true)} className="btn-accent">
            {PART_TWO.revealLabel}
          </button>
        )}
      </div>

      {r1.revealedAll && <GapSummary />}
    </div>
  );
}

/** After reveal: every missed cell, grouped by option, with the reasoning sentence already written for it. */
function GapSummary() {
  const r1 = useRoute1();

  const byOption = OPTIONS.map((o) => ({
    option: o,
    misses: r1.missedCells.filter((c) => c.option.id === o.id),
  })).filter((g) => g.misses.length > 0);

  return (
    <div className="reveal-in space-y-3">
      <p className="text-micro font-semibold uppercase tracking-wide text-ash">{PART_TWO.gapHeading}</p>

      {r1.gapCells.length === 0 ? (
        <p className="text-caption text-ash">{PART_TWO.gapNone}</p>
      ) : byOption.length === 0 ? (
        <p className="text-caption text-ash">{PART_TWO.gapEmpty}</p>
      ) : (
        <div className="space-y-3">
          {byOption.map(({ option, misses }) => (
            <div key={option.id} className="rounded-xl border border-line bg-canvas p-3">
              <p className="text-caption font-semibold text-ink">
                Option {option.id} — {option.short}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {misses.map((c) => (
                  <li key={c.criterion.id} className="text-caption text-ash">
                    <span className="font-semibold text-ink">{c.criterion.name}</span> — you said{" "}
                    {BUCKETS.find((b) => b.id === c.predicted)!.label}, model profile is{" "}
                    {BUCKETS.find((b) => b.id === c.actualBucket)!.label}.{" "}
                    {criterionCellWhy(c.criterion, option.id)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <details className="rounded-xl border border-line bg-canvas p-3">
        <summary className="cursor-pointer text-caption font-semibold text-ink">{PART_TWO.allReasoningLabel}</summary>
        <div className="mt-2 space-y-3">
          {OPTIONS.map((o) => (
            <div key={o.id}>
              <p className="text-micro font-semibold uppercase tracking-wide text-ash">
                Option {o.id} — {o.short}
              </p>
              <ul className="mt-1 space-y-1">
                {CRITERIA.map((c) => (
                  <li key={c.id} className="text-caption text-ash">
                    <span className="font-semibold text-ink">{c.name}: </span>
                    {criterionCellWhy(c, o.id)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
