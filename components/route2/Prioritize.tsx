"use client";

import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { UndoRedoControls } from "@/components/ui/UndoRedoControls";
import { ChevronDown, Close } from "@/components/icons/LineIcons";
import {
  CRITERIA,
  EXERCISE_1,
  QUARTERS,
  R2,
  RANK_SLOTS,
  RELEVANCE_DRIVERS,
  RELEVANCE_REQUIRED,
  ROLES,
  SECTION_1,
  SECTION_2,
  SECTION_3,
} from "@/lib/route2";
import { useCriteriaActions } from "./actions";
import { ExerciseHeader } from "./ExerciseHeader";
import { domId, type Route2State } from "./useRoute2";

/**
 * Exercise 1 — Prioritize. Consolidates the former Relevance, Guiding
 * Decisions and Decision Logic sections into one flat exercise (CLAUDE.md
 * #14: one card instead of three repeated ones). Three judgements, in the
 * order a memo actually needs them:
 *
 *  - Strategic relevance: pick 3 of 7 drivers (unordered — click to toggle).
 *  - Decision logic: rank the top 3 of 7 criteria (day11 RankExercise's
 *    click-to-add/remove/reorder pattern — no drag-and-drop, CLAUDE.md #9).
 *  - Guiding decisions: three free-text decisions with an owner and a
 *    quarter each. These have no fixed candidate list, so they do not fit
 *    the click-to-rank pattern the other two use — kept as the direct
 *    fields they always were, just folded into this same card.
 */
export function Prioritize({ r2 }: { r2: Route2State }) {
  const toggleCheck = useProgress((s) => s.toggleCheck);
  const setNote = useProgress((s) => s.setNote);
  const choose = useProgress((s) => s.choose);
  const actions = useCriteriaActions();

  const toggleRelevance = (id: string) => {
    const on = r2.relevanceSelected.includes(id as never);
    if (!on && r2.relevanceSelected.length >= RELEVANCE_REQUIRED) return;
    toggleCheck(R2.relevance(id), !on);
  };

  return (
    <section id={domId.relevance} className="scroll-mt-24 space-y-6 rounded-2xl border border-line bg-paper p-5">
      <ExerciseHeader n={EXERCISE_1.n} title={EXERCISE_1.title} minutes={EXERCISE_1.minutes} intro={EXERCISE_1.intro} material={EXERCISE_1.material} />

      {/* 1a — Strategic relevance: pick 3 of 7 */}
      <div className="space-y-3 border-t border-line pt-4">
        <div>
          <p className="text-caption font-semibold text-ink">{SECTION_1.title}</p>
          <p className="mt-0.5 text-micro text-ash">
            {SECTION_1.instruction} {SECTION_1.helper}
          </p>
        </div>

        <div id={domId.relevanceDriver} className="scroll-mt-24">
          <div className="grid gap-2 sm:grid-cols-2">
            {RELEVANCE_DRIVERS.map((d) => {
              const on = r2.relevanceSelected.includes(d.id);
              const disabled = !on && r2.relevanceSelected.length >= RELEVANCE_REQUIRED;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleRelevance(d.id)}
                  aria-pressed={on}
                  className={clsx(
                    "rounded-xl border p-2.5 text-left text-caption transition-colors duration-150",
                    on ? "border-accent bg-accentSoft font-semibold text-accent" : disabled ? "cursor-not-allowed border-line bg-canvas text-ash/60" : "border-line bg-canvas text-ink hover:border-ash",
                  )}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          <p className={clsx("mt-1.5 text-micro tabular-nums", r2.relevanceSelected.length === RELEVANCE_REQUIRED ? "text-accent" : "text-ash")}>
            {r2.relevanceSelected.length} of {RELEVANCE_REQUIRED} selected
          </p>
        </div>

        <div id={domId.relevanceRationale} className="scroll-mt-24">
          <label htmlFor="r2-relevance-rationale" className="block text-caption font-semibold text-ink">
            {SECTION_1.rationale.label}
          </label>
          <textarea
            id="r2-relevance-rationale"
            rows={3}
            value={r2.relevanceRationale}
            onChange={(e) => setNote(R2.relevanceRationale, e.target.value)}
            placeholder={SECTION_1.rationale.placeholder}
            className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
          />
          <p className={clsx("mt-1 text-micro tabular-nums", r2.relevanceRationale.trim().length >= SECTION_1.rationale.min ? "text-accent" : "text-ash")}>
            {r2.relevanceRationale.trim().length} / {SECTION_1.rationale.min} characters minimum
          </p>
        </div>
      </div>

      {/* 1b — Decision logic: rank 3 of 7 criteria */}
      <div id={domId.logic} className="scroll-mt-24 space-y-3 border-t border-line pt-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-caption font-semibold text-ink">{SECTION_3.title}</p>
            <p className="mt-0.5 max-w-prose text-micro text-ash">{SECTION_3.instruction}</p>
          </div>
          <UndoRedoControls onUndo={actions.undo} onRedo={actions.redo} canUndo={actions.canUndo} canRedo={actions.canRedo} />
        </div>

        <div id={domId.criteriaRank} className="scroll-mt-24 rounded-xl border border-line bg-canvas p-3">
          <p className="text-micro font-semibold uppercase tracking-wide text-ash">Your top three</p>
          <ol className="mt-2 space-y-2">
            {Array.from({ length: RANK_SLOTS }).map((_, i) => {
              const id = r2.criteriaOrder[i];
              const c = id ? CRITERIA.find((x) => x.id === id) : null;
              return (
                <li key={i}>
                  {c ? (
                    <div className="reveal-in flex items-start gap-2 rounded-xl border border-accent/40 bg-paper p-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-caption font-bold text-paper">{i + 1}</span>
                      <button type="button" onClick={() => actions.remove(c.id)} className="min-w-0 flex-1 text-left">
                        <span className="block text-caption font-semibold text-ink">{c.name}</span>
                        <span className="block text-micro text-ash">{c.definition}</span>
                      </button>
                      <div className="flex shrink-0 items-center gap-1">
                        <button type="button" onClick={() => actions.move(i, -1)} aria-label={`Move ${c.name} up`} className="rounded-md border border-line p-1 text-ash hover:text-ink">
                          <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                        </button>
                        <button type="button" onClick={() => actions.move(i, 1)} aria-label={`Move ${c.name} down`} className="rounded-md border border-line p-1 text-ash hover:text-ink">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => actions.remove(c.id)} aria-label={`Remove ${c.name}`} className="rounded-md border border-line p-1 text-ash hover:text-danger">
                          <Close className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-line bg-paper p-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mist text-caption font-bold text-ash">{i + 1}</span>
                      <span className="text-caption text-ash">Empty — click a criterion below to fill it.</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <ul className="grid gap-2 md:grid-cols-2">
          {CRITERIA.map((c) => {
            const pos = r2.criteriaOrder.indexOf(c.id);
            const ranked = pos >= 0;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => (ranked ? actions.remove(c.id) : actions.add(c.id))}
                  aria-pressed={ranked}
                  className={clsx(
                    "flex h-full w-full items-start gap-2 rounded-xl border p-3 text-left transition-colors duration-150",
                    ranked ? "border-accent bg-accentSoft" : "border-line bg-canvas hover:border-ash",
                  )}
                >
                  <span className={clsx("flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-micro font-bold", ranked ? "bg-accent text-paper" : "bg-paper text-ash")}>
                    {ranked ? `#${pos + 1}` : ""}
                  </span>
                  <span>
                    <span className={clsx("block text-caption font-semibold", ranked ? "text-accent" : "text-ink")}>{c.name}</span>
                    <span className="mt-0.5 block text-micro text-ash">{c.definition}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div id={domId.boundary} className="scroll-mt-24">
          <label htmlFor="r2-boundary-field" className="block text-caption font-semibold text-ink">
            {SECTION_3.boundary.label}
          </label>
          <p className="mt-0.5 text-micro text-ash">{SECTION_3.boundary.helper}</p>
          <input
            id="r2-boundary-field"
            type="text"
            value={r2.boundary}
            onChange={(e) => setNote(R2.boundary, e.target.value)}
            placeholder={SECTION_3.boundary.placeholder}
            className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
          />
        </div>
      </div>

      {/* 1c — Guiding decisions */}
      <div id={domId.guiding} className="scroll-mt-24 space-y-3 border-t border-line pt-4">
        <div>
          <p className="text-caption font-semibold text-ink">{SECTION_2.title}</p>
          <p className="mt-0.5 text-micro text-ash">{SECTION_2.helper}</p>
        </div>
        <div className="space-y-4">
          {([1, 2, 3] as const).map((n) => {
            const g = r2.guidingDecisions[n - 1];
            return (
              <div key={n} className="rounded-xl border border-line bg-canvas p-3">
                <label htmlFor={`r2-guiding-${n}`} className="block text-caption font-semibold text-ink">
                  Guiding decision {n}
                </label>
                <input
                  id={domId.guidingText(n)}
                  type="text"
                  value={g.text}
                  onChange={(e) => setNote(R2.guidingText(n), e.target.value)}
                  placeholder={SECTION_2.placeholder(n)}
                  className="mt-2 w-full scroll-mt-24 rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div id={domId.guidingOwner(n)} className="scroll-mt-24">
                    <label htmlFor={`r2-guiding-${n}-owner`} className="block text-micro font-semibold uppercase tracking-wide text-ash">
                      Owner
                    </label>
                    <select
                      id={`r2-guiding-${n}-owner`}
                      value={g.owner ?? ""}
                      onChange={(e) => choose(R2.guidingOwner(n), e.target.value)}
                      className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1.5 text-caption text-ink"
                    >
                      <option value="">— choose —</option>
                      {ROLES.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div id={domId.guidingQuarter(n)} className="scroll-mt-24">
                    <label htmlFor={`r2-guiding-${n}-quarter`} className="block text-micro font-semibold uppercase tracking-wide text-ash">
                      Quarter
                    </label>
                    <select
                      id={`r2-guiding-${n}-quarter`}
                      value={g.quarter ?? ""}
                      onChange={(e) => choose(R2.guidingQuarter(n), e.target.value)}
                      className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1.5 text-caption text-ink"
                    >
                      <option value="">— choose —</option>
                      {QUARTERS.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
