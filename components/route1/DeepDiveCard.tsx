"use client";

import { useState } from "react";
import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { AnswerKey } from "@/components/ui/AnswerKey";
import { Help, Icon } from "@/components/icons/LineIcons";
import {
  APPROACH_FIELD,
  BOTH_FIELD,
  DEEP_DIVE,
  HORIZONS,
  HORIZON_FIELD,
  R1,
  READINGS,
  READING_FIELD,
  ROOT_CAUSES,
  ZONES,
  ZONE_FAMILIES,
  ZONE_FIELD,
  materialRefs,
} from "@/lib/route1";
import { domId, type Analysis } from "./useRoute1";

/**
 * Step 3 — one escalated signal, analysed in full: the area affected, the
 * sustainability reading, the time horizon, and the improvement approach.
 *
 * The check covers area and horizon together and reports at the level of the
 * analysis, because horizon is a two-way choice (CLAUDE.md #13). When it
 * holds, the reasoning shows why; when it does not, a clue gives a direction
 * for both, and after two genuine checks the learner may ask for the
 * reasoning — recorded in the export. Reading and the improvement approach
 * are required but never checked for correctness, the same as free text.
 */
export function DeepDiveCard({ analysis, position }: { analysis: Analysis; position: number }) {
  const { signal } = analysis;
  const choose = useProgress((s) => s.choose);
  const setNote = useProgress((s) => s.setNote);
  const toggleCheck = useProgress((s) => s.toggleCheck);
  const notes = useProgress((s) => s.notes);
  const [error, setError] = useState(false);
  const [clueOpen, setClueOpen] = useState(false);

  const runCheck = () => {
    if (!analysis.zone || !analysis.horizon) {
      setError(true);
      scrollToAndFlash(!analysis.zone ? domId.zone(signal.id) : domId.horizon(signal.id));
      return;
    }
    setError(false);
    setNote(R1.analysisChecks(signal.id), String(analysis.checks + 1));
    setNote(R1.analysisLastSig(signal.id), `${analysis.zone}:${analysis.horizon}`);
  };

  const showReveal = analysis.checks >= DEEP_DIVE.revealAfter && analysis.verdict !== "holds" && !analysis.revealed;
  const stale = analysis.checks > 0 && !analysis.fresh && !!analysis.zone && !!analysis.horizon;
  const triageLabel = analysis.triage.tag ? ROOT_CAUSES.find((r) => r.id === analysis.triage.tag)?.label : null;

  return (
    <article
      id={domId.analysis(signal.id)}
      className="scroll-mt-24 space-y-4 rounded-2xl border border-accent/40 bg-paper p-4"
    >
      <div>
        <p className="text-micro font-semibold uppercase tracking-wide text-accent">
          {DEEP_DIVE.kicker} #{position}
        </p>
        <h4 className="mt-0.5 text-h3 text-ink">
          Signal {signal.n} — {signal.title}
        </h4>
      </div>

      <blockquote className="rounded-xl border-l-4 border-l-ash/40 bg-canvas px-4 py-3 text-body italic text-ink">
        &ldquo;{signal.text}&rdquo;
      </blockquote>

      <p className="text-micro text-ash">
        {triageLabel ? (
          <>
            {DEEP_DIVE.triageReminder}: <span className="font-semibold text-ink">{triageLabel}</span>
            {analysis.triage.evidenceText && (
              <>
                {" "}
                because <span className="text-ink">&ldquo;{analysis.triage.evidenceText}&rdquo;</span>
              </>
            )}
          </>
        ) : (
          DEEP_DIVE.notTriaged
        )}
      </p>

      <MaterialRefs refs={materialRefs(signal.material)} />

      {/* Reading */}
      <div id={domId.reading(signal.id)} className="scroll-mt-24">
        <p className="text-caption font-semibold text-ink">{READING_FIELD.label}</p>
        <p className="mt-0.5 text-micro text-ash">{READING_FIELD.instruction}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {READINGS.map((r) => {
            const on = analysis.reading === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => choose(R1.reading(signal.id), r.id)}
                aria-pressed={on}
                className={clsx(
                  "rounded-xl border p-2.5 text-left transition-colors duration-150",
                  on ? "border-accent bg-accentSoft" : "border-line bg-canvas hover:border-ash",
                )}
              >
                <span className={clsx("block text-caption font-semibold", on ? "text-accent" : "text-ink")}>{r.label}</span>
                <span className="mt-0.5 block text-micro text-ash">{r.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {analysis.reading === "both" && (
        <div id={domId.bothWhy(signal.id)} className="scroll-mt-24">
          <label htmlFor={`bothwhy-${signal.id}`} className="block text-caption font-semibold text-ink">
            {BOTH_FIELD.label}
          </label>
          <p className="mt-0.5 text-micro text-ash">{BOTH_FIELD.instruction}</p>
          <input
            id={`bothwhy-${signal.id}`}
            type="text"
            value={analysis.bothWhy}
            onChange={(e) => setNote(R1.bothWhy(signal.id), e.target.value)}
            placeholder={BOTH_FIELD.placeholder}
            className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
          />
        </div>
      )}

      {/* Area / zone */}
      <div id={domId.zone(signal.id)} className="scroll-mt-24">
        <p className="text-caption font-semibold text-ink">{ZONE_FIELD.label}</p>
        <p className="mt-0.5 text-micro text-ash">{ZONE_FIELD.instruction}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {ZONES.map((z) => {
            const on = analysis.zone === z.id;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => choose(R1.zone(signal.id), z.id)}
                aria-pressed={on}
                title={ZONE_FAMILIES[z.family].label}
                className={clsx(
                  "flex items-start gap-2 rounded-xl border p-2.5 text-left transition-colors duration-150",
                  z.family === "crosscutting" && "border-dashed",
                  on ? "border-accent bg-accentSoft" : "border-line bg-canvas hover:border-ash",
                )}
              >
                <Icon name={z.icon} className={clsx("mt-0.5 h-4 w-4 shrink-0", on ? "text-accent" : "text-ash")} />
                <span>
                  <span className={clsx("block text-caption font-semibold", on ? "text-accent" : "text-ink")}>{z.name}</span>
                  <span className="mt-0.5 block text-micro text-ash">{z.note}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Horizon */}
      <div id={domId.horizon(signal.id)} className="scroll-mt-24">
        <p className="text-caption font-semibold text-ink">{HORIZON_FIELD.label}</p>
        <p className="mt-0.5 text-micro text-ash">{HORIZON_FIELD.instruction}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {HORIZONS.map((h) => {
            const on = analysis.horizon === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => choose(R1.horizon(signal.id), h.id)}
                aria-pressed={on}
                className={clsx(
                  "rounded-xl border p-2.5 text-left transition-colors duration-150",
                  on ? "border-accent bg-accentSoft" : "border-line bg-canvas hover:border-ash",
                )}
              >
                <span className={clsx("block text-caption font-semibold", on ? "text-accent" : "text-ink")}>{h.label}</span>
                <span className="mt-0.5 block text-micro text-ash">{h.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Check */}
      <div className="space-y-2 rounded-xl border border-line bg-canvas p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={runCheck} className="btn-ghost">
            {analysis.checks > 0 ? DEEP_DIVE.recheckLabel : DEEP_DIVE.checkLabel}
          </button>
          {analysis.verdict === "wrong" && !clueOpen && (
            <button
              type="button"
              onClick={() => setClueOpen(true)}
              className="inline-flex items-center gap-1 text-micro font-semibold text-accent hover:text-accentHi"
            >
              <Help className="h-3.5 w-3.5" />
              {DEEP_DIVE.clueLabel}
            </button>
          )}
          {showReveal && (
            <button
              type="button"
              onClick={() => toggleCheck(R1.analysisReveal(signal.id), true)}
              className="text-micro font-semibold text-warn underline decoration-dotted underline-offset-2"
            >
              {DEEP_DIVE.revealLabel}
            </button>
          )}
          <span className="text-micro text-ash">{DEEP_DIVE.checkScope}</span>
        </div>

        {error && <p className="reveal-in text-caption text-danger">{DEEP_DIVE.incomplete}</p>}
        {!error && analysis.verdict === "holds" && (
          <p className="reveal-in text-caption font-semibold text-accent">{DEEP_DIVE.holds}</p>
        )}
        {!error && analysis.verdict === "wrong" && <p className="reveal-in text-caption text-ink">{DEEP_DIVE.wrong}</p>}
        {!error && stale && <p className="text-caption text-ash">{DEEP_DIVE.stale}</p>}

        {clueOpen && (
          <div className="reveal-in space-y-1 rounded-lg border border-accent/25 bg-accentSoft px-2.5 py-1.5">
            <p className="text-caption text-ink">
              <span className="font-semibold">Area: </span>
              {signal.clue}
            </p>
            <p className="text-caption text-ink">
              <span className="font-semibold">Horizon: </span>
              {HORIZON_FIELD.instruction}
            </p>
          </div>
        )}

        {analysis.reasoningVisible && (
          <div
            className={clsx(
              "reveal-in rounded-xl border px-3 py-2",
              analysis.verdict === "holds" ? "border-accent/30 bg-accentSoft" : "border-warn/40 bg-warn/5",
            )}
          >
            <p className="text-micro font-semibold uppercase tracking-wide text-ash">{DEEP_DIVE.whyLabel}</p>
            <p className="mt-0.5 text-caption text-ink">{signal.analysisWhy}</p>
            {analysis.revealed && analysis.verdict !== "holds" && (
              <p className="mt-1 text-micro text-warn">{DEEP_DIVE.revealNote}</p>
            )}
          </div>
        )}
      </div>

      {/* Improvement approach */}
      <div id={domId.approach(signal.id)} className="scroll-mt-24">
        <label htmlFor={`approach-${signal.id}`} className="block text-caption font-semibold text-ink">
          {APPROACH_FIELD.label}
        </label>
        <p className="mt-0.5 text-micro text-ash">{APPROACH_FIELD.instruction}</p>
        <textarea
          id={`approach-${signal.id}`}
          rows={2}
          value={analysis.approach}
          onChange={(e) => setNote(R1.approach(signal.id), e.target.value)}
          placeholder={APPROACH_FIELD.placeholder}
          className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
        />
        <p
          className={clsx(
            "mt-1 text-micro tabular-nums",
            analysis.approachLength >= APPROACH_FIELD.min ? "text-accent" : "text-ash",
          )}
        >
          {analysis.approachLength} / {APPROACH_FIELD.min} characters minimum
          {analysis.approachLength >= APPROACH_FIELD.min ? " — enough to state an action" : ""}
        </p>
      </div>

      <AnswerKey block={signal.answerKey} />
    </article>
  );
}
