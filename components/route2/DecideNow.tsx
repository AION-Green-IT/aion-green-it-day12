"use client";

import { useState } from "react";
import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { AnswerKey } from "@/components/ui/AnswerKey";
import { Slider } from "@/components/ui/Slider";
import { Help } from "@/components/icons/LineIcons";
import {
  EXERCISE_4,
  FIRST_MEASURE_ANSWER_KEY,
  FIRST_MEASURE_OPTIONS,
  JUSTIFICATION_TEMPLATE,
  R2,
  SECTION_5,
  SECTION_7,
  SELF_ASSESSMENT_ITEMS,
  type SelfAssessmentValue,
} from "@/lib/route2";
import { appendLog, memoClues, memoSignature, type CheckResult } from "./clues";
import { ExerciseHeader } from "./ExerciseHeader";
import { domId, type Route2State } from "./useRoute2";

const SELF_VALUES: { id: SelfAssessmentValue; label: string }[] = [
  { id: "yes", label: "Yes" },
  { id: "partly", label: "Partly" },
  { id: "not-yet", label: "Not yet" },
];

/** Where the self-assessment's old section numbers now live, after the nine-section → four-exercise merge. */
const SELF_ASSESS_TARGET: Record<number, string> = {
  1: domId.relevance,
  3: domId.logic,
  5: domId.measure,
  7: domId.decisionNow,
};

/**
 * Exercise 4 — Decide now. Consolidates the former First Measure, Decide Now,
 * Check Memo and Self-Assessment sections into one flat exercise (CLAUDE.md
 * #14): choose the first measure and justify it, commit to the decision that
 * cannot wait, check the memo's own internal consistency on demand, then
 * rate yourself against the rubric.
 */
export function DecideNow({ r2 }: { r2: Route2State }) {
  const choose = useProgress((s) => s.choose);
  const setNote = useProgress((s) => s.setNote);

  return (
    <section id={domId.decideNow} className="scroll-mt-24 space-y-6 rounded-2xl border border-line bg-paper p-5">
      <ExerciseHeader n={EXERCISE_4.n} title={EXERCISE_4.title} minutes={EXERCISE_4.minutes} intro={EXERCISE_4.intro} material={EXERCISE_4.material} />

      {/* 4a — First measure */}
      <div id={domId.measure} className="scroll-mt-24 space-y-4 border-t border-line pt-4">
        <p className="text-caption font-semibold text-ink">{SECTION_5.title}</p>

        <div id={domId.firstMeasure} className="scroll-mt-24 space-y-2">
          {FIRST_MEASURE_OPTIONS.map((o) => {
            const on = r2.firstMeasure === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => choose(R2.firstMeasure, o.id)}
                aria-pressed={on}
                className={clsx(
                  "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors duration-150",
                  on ? "border-accent bg-accentSoft" : "border-line bg-canvas hover:border-ash",
                )}
              >
                <span className={clsx("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-caption font-bold", on ? "bg-accent text-paper" : "bg-mist text-ash")}>{o.id}</span>
                <span className={clsx("text-caption", on ? "font-semibold text-ink" : "text-ink")}>{o.text}</span>
              </button>
            );
          })}
        </div>

        <div id={domId.justification} className="scroll-mt-24">
          <label htmlFor="r2-justification-field" className="block text-caption font-semibold text-ink">
            {SECTION_5.justification.label}
          </label>
          <details className="mt-1 rounded-lg border border-line bg-canvas px-3 py-2">
            <summary className="cursor-pointer text-micro font-semibold text-accent">Show the reusable justification pattern</summary>
            <p className="mt-1 text-caption italic text-ink">{JUSTIFICATION_TEMPLATE}</p>
          </details>
          <textarea
            id="r2-justification-field"
            rows={6}
            value={r2.justification}
            onChange={(e) => setNote(R2.justification, e.target.value)}
            placeholder={SECTION_5.justification.placeholder}
            className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
          />
          <p className={clsx("mt-1 text-micro tabular-nums", r2.justification.trim().length >= SECTION_5.justification.min ? "text-accent" : "text-ash")}>
            {r2.justification.trim().length} / {SECTION_5.justification.min} characters minimum
          </p>
        </div>

        <div id={domId.committedBudget} className="scroll-mt-24 rounded-xl border border-warn/30 bg-warn/5 p-3">
          <label htmlFor="r2-budget-field" className="block text-caption font-semibold text-ink">
            {SECTION_5.budgetQuestion.label}
          </label>
          <input
            id="r2-budget-field"
            type="text"
            value={r2.committedBudgetAnswer}
            onChange={(e) => setNote(R2.committedBudget, e.target.value)}
            placeholder={SECTION_5.budgetQuestion.placeholder}
            className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
          />
        </div>

        <AnswerKey block={FIRST_MEASURE_ANSWER_KEY} />
      </div>

      {/* 4b — The decision that cannot wait */}
      <div className="space-y-4 border-t border-line pt-4">
        <p className="text-caption font-semibold text-ink">{SECTION_7.title}</p>

        <div id={domId.decisionNow} className="scroll-mt-24">
          <label htmlFor="r2-decision-now-field" className="block text-caption font-semibold text-ink">
            {SECTION_7.decision.label}
          </label>
          <textarea
            id="r2-decision-now-field"
            rows={3}
            value={r2.decisionNow}
            onChange={(e) => setNote(R2.decisionNow, e.target.value)}
            placeholder={SECTION_7.decision.placeholder}
            className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
          />
          <p className={r2.decisionNow.trim().length >= SECTION_7.decision.min ? "mt-1 text-micro tabular-nums text-accent" : "mt-1 text-micro tabular-nums text-ash"}>
            {r2.decisionNow.trim().length} / {SECTION_7.decision.min} characters minimum
          </p>
        </div>

        <div id={domId.confidence} className="scroll-mt-24">
          <Slider
            id="r2-confidence-slider"
            label={SECTION_7.confidence.label}
            instruction={SECTION_7.confidence.helper}
            min={0}
            max={SECTION_7.confidence.max}
            value={r2.confidence}
            onChange={(v) => choose(R2.confidence, String(v))}
            lowLabel="0"
            highLabel="100"
          />
        </div>

        <div id={domId.changeMyMind} className="scroll-mt-24">
          <label htmlFor="r2-change-mind-field" className="block text-caption font-semibold text-ink">
            {SECTION_7.changeMyMind.label}
          </label>
          <input
            id="r2-change-mind-field"
            type="text"
            value={r2.changeMyMind}
            onChange={(e) => setNote(R2.changeMyMind, e.target.value)}
            placeholder={SECTION_7.changeMyMind.placeholder}
            className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
          />
        </div>
      </div>

      <CheckMemoBlock r2={r2} />

      <SelfAssessmentBlock r2={r2} />
    </section>
  );
}

/**
 * "Check my memo" — on demand, clue-only. Reads the memo's own internal
 * consistency across every exercise, including whether an Option E
 * justification actually engages Vertex's specific conditions. Never states
 * the answer (CLAUDE.md #4).
 */
function CheckMemoBlock({ r2 }: { r2: Route2State }) {
  const setNote = useProgress((s) => s.setNote);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [signature, setSignature] = useState("");

  const run = () => {
    const res = memoClues(r2);
    setResult(res);
    setSignature(memoSignature(r2));
    setNote(R2.checkLog, appendLog(useProgress.getState().notes[R2.checkLog], res));
  };

  const stale = !!result && signature !== memoSignature(r2);

  return (
    <div id={domId.checkMemo} className="scroll-mt-24 space-y-3 border-t border-line pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={run} className="btn-accent">
          {result ? "Check again" : "Check my memo"}
        </button>
        <p className="text-micro text-ash">Reads your own memo for internal consistency — it never grades the choice you made.</p>
      </div>

      <div aria-live="polite">
        {result && (
          <div className="reveal-in space-y-2">
            {stale && <p className="text-micro font-semibold text-warn">Your memo has changed since this check — check again to refresh the clues.</p>}
            {result.status !== "clues" ? (
              <p className="rounded-xl border border-line bg-canvas px-3 py-2 text-caption text-ink">
                {result.message ?? "Nothing in your memo contradicts itself on what this check can read. That is not a verdict on the argument itself — read it once more against Vertex's five specific conditions."}
              </p>
            ) : (
              <>
                <p className="text-micro font-semibold uppercase tracking-wide text-ash">Clues from your own memo</p>
                <ol className="space-y-2">
                  {result.clues.map((clue) => (
                    <li key={clue.id} className="flex gap-2 rounded-xl border border-warn/40 bg-warn/5 px-3 py-2">
                      <Help className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
                      <div className="min-w-0">
                        <p className="text-caption text-ink">{clue.text}</p>
                        <button
                          type="button"
                          onClick={() => scrollToAndFlash(clue.target)}
                          className="mt-1 text-micro font-semibold text-accent underline decoration-dotted underline-offset-2 hover:text-accentHi"
                        >
                          Take me there
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Optional, never graded, never part of `missing` — the rubric self-check the learner can compare their own memo against. */
function SelfAssessmentBlock({ r2 }: { r2: Route2State }) {
  const choose = useProgress((s) => s.choose);

  return (
    <div id={domId.selfAssessment} className="scroll-mt-24 space-y-3 rounded-2xl border border-line bg-mist p-4">
      <div>
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">Optional · not graded, not required for export</p>
        <h4 className="mt-1 text-caption font-semibold text-ink">Rate your own memo against the rubric</h4>
      </div>
      <ul className="space-y-2">
        {SELF_ASSESSMENT_ITEMS.map((item) => {
          const value = r2.selfAssessment[item.id];
          return (
            <li key={item.id} className="rounded-xl border border-line bg-paper p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="max-w-prose text-caption text-ink">{item.label}</p>
                <button
                  type="button"
                  onClick={() => scrollToAndFlash(SELF_ASSESS_TARGET[item.section] ?? domId.decideNow, "ref")}
                  className="shrink-0 rounded-full border border-line px-2 py-0.5 text-micro font-semibold text-accent hover:border-accent"
                >
                  Where this came from
                </button>
              </div>
              <div className="mt-2 flex gap-1.5">
                {SELF_VALUES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => choose(R2.selfAssess(item.id), v.id)}
                    aria-pressed={value === v.id}
                    className={clsx(
                      "rounded-full border px-3 py-1 text-micro font-semibold transition-colors duration-150",
                      value === v.id ? "border-accent bg-accentSoft text-accent" : "border-line bg-canvas text-ash hover:border-ash",
                    )}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
