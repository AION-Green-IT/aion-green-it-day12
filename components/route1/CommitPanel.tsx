"use client";

import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { AnswerKey } from "@/components/ui/AnswerKey";
import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { SeriesSwatch } from "@/components/ui/RadarChart";
import { COMMIT, JUSTIFICATION_TEMPLATE, OPTIONS, PART_TWO, R1, SOFT_CHECK, materialRefs } from "@/lib/route1";
import { OPTION_STYLE } from "./optionStyle";
import { domId, type Route1State } from "./useRoute1";

/**
 * The commitment (§10.3): one option; a justification written under
 * incomplete information, with a soft checker that reads the wording but never
 * blocks; two follow-up decisions; and two risks of the option the learner's
 * own ranking marks as most attractive in the short term — or, if that is the
 * one they chose, the two risks they are accepting.
 */
export function CommitPanel({ r1 }: { r1: Route1State }) {
  const choose = useProgress((s) => s.choose);
  const setNote = useProgress((s) => s.setNote);

  const signals = r1.justificationSignals;
  const target = r1.riskTarget;
  const riskPrompt = !target
    ? COMMIT.risks.promptUnknown
    : target.mode === "chosen"
      ? COMMIT.risks.promptChosen
      : COMMIT.risks.promptNotChosen(target.option);

  return (
    <div className="space-y-6 rounded-2xl border border-line bg-paper p-5">
      <div>
        <h3 className="text-h3 text-ink">Commit and justify</h3>
        <p className="mt-1 max-w-prose text-caption text-ash">
          SmartLink can prioritise one line of measures. Choose it, and write the justification you would put in front of
          the people who approve it — including what would make you change your mind.
        </p>
        <MaterialRefs refs={materialRefs(["uncertainty", "system", "lens"])} />
      </div>

      {/* The choice */}
      <div id={domId.chosen} className="scroll-mt-24">
        <p className="text-caption font-semibold text-ink">{COMMIT.chosen.label}</p>
        <p className="mt-0.5 text-micro text-ash">{COMMIT.chosen.instruction}</p>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {OPTIONS.map((o) => {
            const on = r1.chosen === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => choose(R1.chosen, o.id)}
                aria-pressed={on}
                className={clsx(
                  "rounded-xl border p-3 text-left transition-colors duration-150",
                  on ? "border-accent bg-accentSoft" : "border-line bg-canvas hover:border-ash",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className={clsx("text-caption font-semibold", on ? "text-accent" : "text-ink")}>Option {o.id}</span>
                  <SeriesSwatch style={OPTION_STYLE[o.id]} />
                </span>
                <span className="mt-1 block text-caption text-ink">{o.short}</span>
                <span className="mt-1 block text-micro tabular-nums text-ash">
                  predicted: {r1.optionStateById(o.id).predictedCount}/7 criteria
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The justification */}
      <div id={domId.justification} className="scroll-mt-24">
        <label htmlFor="r1-justification-field" className="block text-caption font-semibold text-ink">
          {COMMIT.justification.label}
        </label>
        <p className="mt-0.5 text-micro text-ash">{COMMIT.justification.instruction}</p>
        <details className="mt-2 rounded-lg border border-line bg-canvas px-3 py-2">
          <summary className="cursor-pointer text-micro font-semibold text-accent">{PART_TWO.templateLabel}</summary>
          <p className="mt-1 text-caption italic text-ink">{JUSTIFICATION_TEMPLATE}</p>
        </details>
        <textarea
          id="r1-justification-field"
          rows={7}
          value={r1.justification}
          onChange={(e) => setNote(R1.justification, e.target.value)}
          placeholder={COMMIT.justification.placeholder}
          className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
        />
        <p
          className={clsx(
            "mt-1 text-micro tabular-nums",
            r1.justificationLength >= COMMIT.justification.min ? "text-accent" : "text-ash",
          )}
        >
          {r1.justificationLength} / {COMMIT.justification.min} characters minimum
        </p>
        {r1.justificationLength >= 60 && (
          <ul aria-live="polite" className="mt-2 space-y-1 rounded-lg border border-line bg-canvas px-3 py-2 text-micro">
            {signals.assumption && signals.falsifier && signals.reviewPoint ? (
              <li className="font-semibold text-accent">✓ {SOFT_CHECK.ok}</li>
            ) : (
              <>
                {!signals.reviewPoint && <li className="font-semibold text-warn">△ {SOFT_CHECK.review}</li>}
                {!signals.falsifier && <li className="font-semibold text-warn">△ {SOFT_CHECK.falsifier}</li>}
              </>
            )}
            <li className="text-ash">{SOFT_CHECK.note}</li>
          </ul>
        )}
      </div>

      {/* Follow-up decisions */}
      <div className="grid gap-4 md:grid-cols-2">
        {([1, 2] as const).map((n) => (
          <Field
            key={`followup-${n}`}
            anchorId={domId.followUp(n)}
            id={`r1-followup-field-${n}`}
            label={COMMIT.followUp.label(n)}
            instruction={COMMIT.followUp.instruction}
            placeholder={COMMIT.followUp.placeholder}
            value={r1.followUps[n - 1]}
            onChange={(v) => setNote(R1.followUp(n), v)}
          />
        ))}
      </div>

      {/* Risks of the short-term-attractive option */}
      <div id={domId.risks} className="scroll-mt-24 space-y-3 rounded-xl border border-line bg-canvas p-4">
        <p aria-live="polite" className="text-caption font-semibold text-ink">
          {riskPrompt}
        </p>
        <p className="text-micro text-ash">{COMMIT.risks.howComputed}</p>
        <div className="grid gap-4 md:grid-cols-2">
          {([1, 2] as const).map((n) => (
            <Field
              key={`risk-${n}`}
              anchorId={domId.risk(n)}
              id={`r1-risk-field-${n}`}
              label={target ? `Risk ${n} for Option ${target.option}` : COMMIT.risks.label(n)}
              instruction={COMMIT.risks.instruction}
              placeholder={target ? `A concrete consequence of Option ${target.option}…` : "Rank Innovation benefit and Feasibility first…"}
              value={r1.risks[n - 1]}
              onChange={(v) => setNote(R1.risk(n), v)}
            />
          ))}
        </div>
      </div>

      <AnswerKey block={COMMIT.answerKey} />
    </div>
  );
}

function Field({
  anchorId,
  id,
  label,
  instruction,
  placeholder,
  value,
  onChange,
}: {
  anchorId: string;
  id: string;
  label: string;
  instruction: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div id={anchorId} className="scroll-mt-24">
      <label htmlFor={id} className="block text-caption font-semibold text-ink">
        {label}
      </label>
      <p className="mt-0.5 text-micro text-ash">{instruction}</p>
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
      />
    </div>
  );
}
