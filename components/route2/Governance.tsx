"use client";

import { useProgress } from "@/lib/store";
import { RaciGrid } from "@/components/ui/RaciGrid";
import { UndoRedoControls } from "@/components/ui/UndoRedoControls";
import { EXERCISE_3, R2, RESPONSIBILITIES, SECTION_6 } from "@/lib/route2";
import { useGovernanceRaciActions } from "./actions";
import { ExerciseHeader } from "./ExerciseHeader";
import { domId, type Route2State } from "./useRoute2";

/** Exercise 3 — governance: a RACI grid (4 responsibilities × 6 roles) plus the review-mechanism field. */
export function Governance({ r2 }: { r2: Route2State }) {
  const setNote = useProgress((s) => s.setNote);
  const actions = useGovernanceRaciActions();

  return (
    <section id={domId.governance} className="scroll-mt-24 space-y-4 rounded-2xl border border-line bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <ExerciseHeader n={EXERCISE_3.n} title={EXERCISE_3.title} minutes={EXERCISE_3.minutes} intro={EXERCISE_3.intro} material={EXERCISE_3.material} />
        <UndoRedoControls onUndo={actions.undo} onRedo={actions.redo} canUndo={actions.canUndo} canRedo={actions.canRedo} />
      </div>

      <div>
        {/* idPrefix matches domId.raciRow exactly, so RaciGrid's own row ids ("r2-ex3-row-{id}")
            are what the missing list and the check-on-demand clues scroll to and flash. */}
        <RaciGrid
          idPrefix="r2-ex3"
          rows={RESPONSIBILITIES}
          roles={r2.raciRoles}
          showCapacity={false}
          value={r2.raciValue}
          onCycle={(rowId, roleId, next) => actions.cycle(rowId, roleId, next)}
          onReset={actions.reset}
          labels={{ manyA: "More than one Accountable in this row.", noA: "No Accountable in this row.", noR: "No Responsible in this row.", authority: "" }}
        />
      </div>

      <div id={domId.reviewMechanism} className="scroll-mt-24">
        <label htmlFor="r2-review-field" className="block text-caption font-semibold text-ink">
          {SECTION_6.review.label}
        </label>
        <p className="mt-0.5 text-micro text-ash">{SECTION_6.review.helper}</p>
        <textarea
          id="r2-review-field"
          rows={2}
          value={r2.reviewMechanism}
          onChange={(e) => setNote(R2.reviewMechanism, e.target.value)}
          placeholder={SECTION_6.review.placeholder}
          className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
        />
      </div>
    </section>
  );
}
