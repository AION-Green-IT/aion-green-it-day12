"use client";

import clsx from "clsx";
import { UndoRedoControls } from "@/components/ui/UndoRedoControls";
import { Close } from "@/components/icons/LineIcons";
import { EXERCISE_2, FACTORS, SECTION_4, TRADEOFF_MAX, TRADEOFF_QUESTIONS, factorLabel, tradeoffQuadrantById, type FactorId, type TradeoffAnswer } from "@/lib/route2";
import { useTradeOffActions } from "./actions";
import { ExerciseHeader } from "./ExerciseHeader";
import { TradeoffMapSvg } from "./TradeoffMapSvg";
import { domId, type Route2State, type TradeoffPairState } from "./useRoute2";

/**
 * Exercise 2 — the trade-off map. Replaces the former TensionPicker (eight
 * factors on a ring, click one then an opposing one to draw a link) with a
 * flat factor grid for picking the pair, plus a 2×2 quadrant map the pair
 * slides onto once two diagnostic yes/no questions are answered — decide,
 * then discover the position, never drag it there directly (day11's
 * MapExercise pattern; CURRICULUM-GUIDE §5).
 *
 * There is no fixed correct quadrant for a given factor pair — which trade-off
 * is "real" for Vertex is the learner's own judgement, so unlike day11's
 * MapExercise this map is not graded; "Remove" clears a pair immediately for
 * a different pick (CLAUDE.md #5), and undo/redo covers every answer.
 */
export function TradeOffMap({ r2 }: { r2: Route2State }) {
  const actions = useTradeOffActions();

  return (
    <section id={domId.tradeoffs} className="scroll-mt-24 space-y-4 rounded-2xl border border-line bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <ExerciseHeader n={EXERCISE_2.n} title={EXERCISE_2.title} minutes={EXERCISE_2.minutes} intro={EXERCISE_2.intro} material={EXERCISE_2.material} />
        <UndoRedoControls onUndo={actions.undo} onRedo={actions.redo} canUndo={actions.canUndo} canRedo={actions.canRedo} />
      </div>

      <div className="rounded-xl border border-line bg-canvas p-3">
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">
          Pick two opposing factors · {r2.tradeOffLinks.length} of {TRADEOFF_MAX} pairs drawn
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FACTORS.map((f) => {
            const on = r2.pendingLink === f.id;
            const touched = r2.tradeOffLinks.some((l) => l.a === f.id || l.b === f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => actions.clickFactor(f.id, TRADEOFF_MAX)}
                aria-pressed={on}
                className={clsx(
                  "rounded-xl border p-2.5 text-center text-caption font-semibold transition-colors duration-150",
                  on ? "border-accent bg-accent text-paper" : touched ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink hover:border-ash",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <p aria-live="polite" className="mt-2 text-center text-micro text-ash">
          {r2.pendingLink
            ? `${factorLabel(r2.pendingLink)} selected — click an opposing factor to pair it, or click it again to cancel.`
            : `${r2.tradeOffLinks.length} pair${r2.tradeOffLinks.length === 1 ? "" : "s"} drawn.`}
        </p>
      </div>

      <div className="mx-auto max-w-[420px] rounded-xl border border-line bg-canvas p-3">
        <TradeoffMapSvg states={r2.tradeoffStates} />
      </div>

      <p className="text-center text-micro text-ash">{SECTION_4.helper}</p>

      {r2.tradeoffStates.length > 0 && (
        <ul className="space-y-3">
          {r2.tradeoffStates.map((s) => (
            <PairCard key={`${s.link.a}-${s.link.b}`} state={s} onAnswer={actions.answer} onRemove={actions.remove} onSetNote={actions.setNoteText} />
          ))}
        </ul>
      )}
    </section>
  );
}

function PairCard({
  state,
  onAnswer,
  onRemove,
  onSetNote,
}: {
  state: TradeoffPairState;
  onAnswer: (a: FactorId, b: FactorId, key: "q1" | "q2", value: TradeoffAnswer) => void;
  onRemove: (a: FactorId, b: FactorId) => void;
  onSetNote: (a: FactorId, b: FactorId, note: string) => void;
}) {
  const { link } = state;
  const quadrant = state.quadrant ? tradeoffQuadrantById(state.quadrant) : null;

  return (
    <li id={domId.tradeoffPair(link.a, link.b)} className="scroll-mt-24 rounded-xl border border-line bg-canvas p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-caption font-semibold text-ink">
            {factorLabel(link.a)} ↔ {factorLabel(link.b)}
          </p>
          <p
            className={clsx(
              "mt-1 inline-block rounded-full px-2 py-0.5 text-micro font-semibold",
              quadrant ? "bg-accentSoft text-accent" : "border border-line text-ash",
            )}
          >
            {quadrant ? `On the map: ${quadrant.label}` : "Not placed — answer both questions"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(link.a, link.b)}
          aria-label={`Remove the ${factorLabel(link.a)} ↔ ${factorLabel(link.b)} pair`}
          className="rounded-md border border-line p-1 text-ash hover:text-danger"
        >
          <Close className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {(["q1", "q2"] as const).map((qk) => {
          const q = TRADEOFF_QUESTIONS[qk];
          const value = qk === "q1" ? link.q1 : link.q2;
          return (
            <div key={qk} id={qk === "q1" ? domId.tradeoffQ1(link.a, link.b) : domId.tradeoffQ2(link.a, link.b)} className="scroll-mt-24">
              <p className="text-caption font-semibold text-ink">
                <span className="text-ash">{q.label} · </span>
                {q.question}
              </p>
              <p className="mt-0.5 text-micro text-ash">{q.instruction}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {(["yes", "no"] as const).map((v) => {
                  const on = value === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => onAnswer(link.a, link.b, qk, v)}
                      aria-pressed={on}
                      className={clsx(
                        "rounded-xl border p-2.5 text-left text-caption transition-colors duration-150",
                        on ? "border-accent bg-accentSoft font-semibold text-accent" : "border-line bg-paper text-ink hover:border-ash",
                      )}
                    >
                      {v === "yes" ? q.yes : q.no}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div id={domId.tradeoffNote(link.a, link.b)} className="mt-3 scroll-mt-24">
        <label htmlFor={`tradeoff-note-${link.a}-${link.b}`} className="block text-micro font-semibold text-ash">
          {SECTION_4.noteLabel}
        </label>
        <input
          id={`tradeoff-note-${link.a}-${link.b}`}
          type="text"
          value={link.note}
          onChange={(e) => onSetNote(link.a, link.b, e.target.value)}
          placeholder={SECTION_4.notePlaceholder}
          className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-caption text-ink"
        />
      </div>
    </li>
  );
}
