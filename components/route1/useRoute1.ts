"use client";

import { useProgress, useHydrated } from "@/lib/store";
import type { MissingItem } from "@/components/ui/MissingList";
import {
  APPROACH_FIELD,
  COMMIT,
  CRITERIA,
  ESCALATE,
  OPTION_IDS,
  OPTIONS,
  R1,
  SIGNALS,
  analyseJustification,
  bucketForRank,
  isOptionId,
  isZoneId,
  signalExcerpt,
  zoneById,
  type Bucket,
  type Criterion,
  type CriterionId,
  type Horizon,
  type OptionId,
  type Reading,
  type RootCause,
  type ScoreOption,
  type Signal,
  type ZoneId,
} from "@/lib/route1";

/** DOM ids the missing list, the clues and the reference chips scroll to. */
export const domId = {
  name: "r1-name",

  // Part 1 — Step 1: triage
  partOne: "part-1",
  triage: "r1-triage",
  triageRow: (id: string) => `r1-triage-${id}`,
  triageEvidence: (id: string) => `r1-triage-${id}-evidence`,
  triageTag: (id: string) => `r1-triage-${id}-tag`,
  triageCheck: "r1-triage-check",

  // Part 1 — Step 2: escalate
  escalate: "r1-escalate",
  escalateWhy: "r1-escalate-why",

  // Part 1 — Step 3: deep dive (reuses one id shape per signal)
  analysis: (id: string) => `r1-analysis-${id}`,
  reading: (id: string) => `r1-analysis-${id}-reading`,
  bothWhy: (id: string) => `r1-analysis-${id}-bothwhy`,
  zone: (id: string) => `r1-analysis-${id}-zone`,
  horizon: (id: string) => `r1-analysis-${id}-horizon`,
  approach: (id: string) => `r1-analysis-${id}-approach`,

  handover: "r1-handover",

  // Part 2
  partTwo: "part-2",
  predictGrid: "r1-predict-grid",
  revealAction: "r1-reveal-action",
  chosen: "r1-chosen",
  justification: "r1-justification",
  followUp: (n: 1 | 2) => `r1-followup-${n}`,
  risks: "r1-risks",
  risk: (n: 1 | 2) => `r1-risk-${n}`,

  export: "r1-export",
};

const NO_STRINGS: Record<string, string> = {};
const NO_BOOLS: Record<string, boolean> = {};

const asReading = (v?: string): Reading | null => (v === "potential" || v === "risk" || v === "both" ? v : null);
const asRoot = (v?: string): RootCause | null => (v === "technology" || v === "governance" ? v : null);
const asHorizon = (v?: string): Horizon | null => (v === "short" || v === "structural" ? v : null);

// ---------------------------------------------------------------------------
// Step 1 — triage
// ---------------------------------------------------------------------------

export type TriageRowState = {
  signal: Signal;
  tag: RootCause | null;
  /** Index into signal.segments of the tapped phrase, or null. */
  evidence: number | null;
  evidenceText: string | null;
  complete: boolean;
  /** Ground truth — tag correct and the tapped phrase is the decisive one. Only ever surfaced when reasoning is visible. */
  holds: boolean;
};

// ---------------------------------------------------------------------------
// Step 3 — deep dive
// ---------------------------------------------------------------------------

export type Analysis = {
  signal: Signal;
  triage: TriageRowState;
  reading: Reading | null;
  bothWhy: string;
  zone: ZoneId | null;
  horizon: Horizon | null;
  approach: string;
  approachLength: number;
  checks: number;
  fresh: boolean;
  verdict: "holds" | "wrong" | null;
  revealed: boolean;
  reasoningVisible: boolean;
  complete: boolean;
};

// ---------------------------------------------------------------------------
// Part 2 — the shared prediction grid (CLAUDE.md #14)
// ---------------------------------------------------------------------------

export type OptionPredictionState = {
  option: ScoreOption;
  /** Criterion key → predicted bucket. Absent means not set. */
  predictions: Partial<Record<CriterionId, Bucket>>;
  predictedCount: number;
};

/** One cell of the shared 7×3 grid, post-reveal. */
export type GapCell = {
  option: ScoreOption;
  criterion: Criterion;
  predicted: Bucket | null;
  actualBucket: Bucket;
  /** A miss is a set prediction whose bucket doesn't match the model one — never true for an unset cell. */
  miss: boolean;
};

export type RiskTarget = { option: OptionId; mode: "notChosen" | "chosen" };

/**
 * Joins the shared progress store to Route 1's content — both parts, one hook.
 *
 * Until the store has hydrated it reads as empty, so the first client render
 * matches the statically exported HTML. One route has one `missing` list and
 * one definition of done (CLAUDE.md #12). Part 1 is triage (all six, set-level
 * check) → escalate (exactly two, undo-safe) → deep dive (full workup, only on
 * the escalated two, checked per signal) — CLAUDE.md #13. Neither check ever
 * names which specific answer is wrong, and both open onto a "show the
 * reasoning" option after two genuine checks, recorded in the export.
 */
export function useRoute1() {
  const hydrated = useHydrated();
  const rawNotes = useProgress((s) => s.notes);
  const rawChoices = useProgress((s) => s.choices);
  const rawChecks = useProgress((s) => s.checks);

  const notes = hydrated ? rawNotes : NO_STRINGS;
  const choices = hydrated ? rawChoices : NO_STRINGS;
  const checks = hydrated ? rawChecks : NO_BOOLS;

  const name = notes[R1.name] ?? "";

  // -- Step 1: triage ---------------------------------------------------------
  const triage: TriageRowState[] = SIGNALS.map((signal) => {
    const tag = asRoot(choices[R1.rootCause(signal.id)]);
    const rawEv = choices[R1.evidence(signal.id)];
    const evidence = rawEv !== undefined && rawEv !== "" ? Number(rawEv) : null;
    const seg = evidence !== null ? signal.segments[evidence] : null;
    const evidenceText = seg && typeof seg !== "string" ? seg.text : null;
    const decisive = seg && typeof seg !== "string" ? seg.decisive : false;
    return {
      signal,
      tag,
      evidence,
      evidenceText,
      complete: !!tag && evidence !== null,
      holds: tag === signal.rootCause && decisive,
    };
  });

  const triageById = (id: string) => triage.find((t) => t.signal.id === id)!;
  const triageCompleteCount = triage.filter((t) => t.complete).length;
  const triageSignature = triage.map((t) => `${t.signal.id}:${t.tag ?? "-"}:${t.evidence ?? "-"}`).join("|");

  const triageChecks = Number(notes[R1.triageChecks] ?? "0") || 0;
  const triageLastSig = notes[R1.triageLastSig] ?? "";
  const triageLastOk = Number(notes[R1.triageLastOk] ?? "0") || 0;
  const triageFresh = triageChecks > 0 && triageLastSig === triageSignature;
  const triageAllHold = triageFresh && triageLastOk === SIGNALS.length;
  const triageClue = checks[R1.triageClue] === true;
  const triageRevealed = checks[R1.triageReveal] === true;
  const triageRevealAt = Number(notes[R1.triageRevealAt] ?? "0") || 0;
  const triageReasoningVisible = triageAllHold || triageRevealed;

  const tally = {
    total: SIGNALS.length,
    triaged: triageCompleteCount,
    technology: triage.filter((t) => t.complete && t.tag === "technology").length,
    governance: triage.filter((t) => t.complete && t.tag === "governance").length,
  };

  // -- Step 2: escalate ---------------------------------------------------------
  const escalated = (notes[R1.escalate] ?? "")
    .split("|")
    .filter((id) => SIGNALS.some((s) => s.id === id))
    .slice(0, ESCALATE.limit);
  const escalateWhy = (notes[R1.escalateWhy] ?? "").trim();
  const escalatedSignals = escalated.map((id) => SIGNALS.find((s) => s.id === id)!);

  // -- Step 3: deep dive (only the escalated signals) --------------------------
  const analyses: Analysis[] = escalated.map((id) => {
    const signal = SIGNALS.find((s) => s.id === id)!;
    const reading = asReading(choices[R1.reading(id)]);
    const bothWhy = notes[R1.bothWhy(id)] ?? "";
    const zoneRaw = choices[R1.zone(id)];
    const zone = isZoneId(zoneRaw) ? zoneRaw : null;
    const horizon = asHorizon(choices[R1.horizon(id)]);
    const approach = (notes[R1.approach(id)] ?? "").trim();
    const approachLength = approach.length;

    const signature = `${zone ?? "-"}:${horizon ?? "-"}`;
    const analysisChecks = Number(notes[R1.analysisChecks(id)] ?? "0") || 0;
    const lastSig = notes[R1.analysisLastSig(id)] ?? "";
    const fresh = analysisChecks > 0 && lastSig === signature;
    const verdict: "holds" | "wrong" | null = !fresh
      ? null
      : zone && signal.acceptableZones.includes(zone) && horizon === signal.horizon
        ? "holds"
        : "wrong";
    const revealed = checks[R1.analysisReveal(id)] === true;

    return {
      signal,
      triage: triageById(id),
      reading,
      bothWhy,
      zone,
      horizon,
      approach,
      approachLength,
      checks: analysisChecks,
      fresh,
      verdict,
      revealed,
      reasoningVisible: verdict === "holds" || revealed,
      complete:
        !!reading &&
        (reading !== "both" || bothWhy.trim().length > 0) &&
        !!zone &&
        !!horizon &&
        approachLength >= APPROACH_FIELD.min,
    };
  });

  const analysisById = (id: string) => analyses.find((a) => a.signal.id === id);
  const analysisCompleteCount = analyses.filter((a) => a.complete).length;

  // -- Part 2 -------------------------------------------------------------
  // One shared grid (CLAUDE.md #14): rows = criteria, columns = options, each
  // cell a click-to-cycle Low/Mid/High bucket rather than a drag-ranked slot.
  const optionStates: OptionPredictionState[] = OPTIONS.map((option) => {
    const predictions: Partial<Record<CriterionId, Bucket>> = {};
    for (const c of CRITERIA) {
      const raw = choices[R1.predict(option.id, c.id)];
      if (raw === "low" || raw === "mid" || raw === "high") predictions[c.id] = raw;
    }
    return { option, predictions, predictedCount: Object.keys(predictions).length };
  });
  const optionStateById = (id: OptionId) => optionStates.find((s) => s.option.id === id)!;
  const totalPredicted = optionStates.reduce((n, s) => n + s.predictedCount, 0);
  const totalCells = OPTIONS.length * CRITERIA.length;
  const allPredicted = totalPredicted === totalCells;

  // One flag for the whole 7×3 grid — one Reveal action, not one per option.
  const revealedAll = checks[R1.revealed] === true;

  /** Every set prediction, revealed or not — the grid needs this to colour cells even before Reveal is pressed. */
  const gapCells: GapCell[] = revealedAll
    ? optionStates.flatMap((s) =>
        CRITERIA.filter((c) => s.predictions[c.id]).map((c) => {
          const predicted = s.predictions[c.id]!;
          const actualBucket = bucketForRank(c.expected[s.option.id]);
          return { option: s.option, criterion: c, predicted, actualBucket, miss: predicted !== actualBucket };
        }),
      )
    : [];
  const missedCells = gapCells.filter((c) => c.miss);

  const chosenRaw = choices[R1.chosen];
  const chosen: OptionId | null = isOptionId(chosenRaw) ? chosenRaw : null;
  const justification = notes[R1.justification] ?? "";
  const justificationLength = justification.trim().length;
  const justificationSignals = analyseJustification(justification);
  const followUps: [string, string] = [notes[R1.followUp(1)] ?? "", notes[R1.followUp(2)] ?? ""];
  const risks: [string, string] = [notes[R1.risk(1)] ?? "", notes[R1.risk(2)] ?? ""];

  // The short-term-attractive option: highest combined predicted bucket on Innovation + Feasibility —
  // read from the learner's own grid, same as the old "lowest combined rank" read from their own ranks.
  const bucketScore = (b: Bucket | undefined) => (b === "high" ? 3 : b === "mid" ? 2 : b === "low" ? 1 : 0);
  let riskTarget: RiskTarget | null = null;
  const innovationSet = OPTION_IDS.every((o) => optionStateById(o).predictions.innovation);
  const feasibilitySet = OPTION_IDS.every((o) => optionStateById(o).predictions.feasibility);
  if (innovationSet && feasibilitySet) {
    const score = (o: OptionId) =>
      bucketScore(optionStateById(o).predictions.innovation) + bucketScore(optionStateById(o).predictions.feasibility);
    const best = [...OPTION_IDS].sort(
      (a, b) =>
        score(b) - score(a) ||
        bucketScore(optionStateById(b).predictions.innovation) - bucketScore(optionStateById(a).predictions.innovation) ||
        a.localeCompare(b),
    )[0];
    riskTarget = { option: best, mode: chosen === best ? "chosen" : "notChosen" };
  }

  // -- Missing list (standard #1: one entry per concrete gap, in page order) --
  const missingPartOne: MissingItem[] = [];

  for (const t of triage) {
    if (t.complete) continue;
    const who = `Signal ${t.signal.n} — "${signalExcerpt(t.signal)}"`;
    missingPartOne.push({
      id: t.tag ? domId.triageEvidence(t.signal.id) : domId.triageTag(t.signal.id),
      label:
        !t.tag && t.evidence === null
          ? `${who}: root-cause tag and evidence phrase not chosen`
          : !t.tag
            ? `${who}: root-cause tag not chosen`
            : `${who}: evidence phrase not tapped`,
    });
  }
  if (escalated.length < ESCALATE.limit) {
    missingPartOne.push({
      id: domId.escalate,
      label: `Escalate ${ESCALATE.limit} signals for a deeper look — ${escalated.length} of ${ESCALATE.limit} chosen`,
    });
  }
  if (!escalateWhy) {
    missingPartOne.push({ id: domId.escalateWhy, label: "Justification for your two escalated signals" });
  }
  for (const a of analyses) {
    const who = `Signal ${a.signal.n} — ${a.signal.title}`;
    if (!a.reading) missingPartOne.push({ id: domId.reading(a.signal.id), label: `${who}: sustainability reading not selected` });
    if (a.reading === "both" && !a.bothWhy.trim()) {
      missingPartOne.push({ id: domId.bothWhy(a.signal.id), label: `${who}: "Both" was selected but no one-line justification given` });
    }
    if (!a.zone) missingPartOne.push({ id: domId.zone(a.signal.id), label: `${who}: area affected not selected` });
    if (!a.horizon) missingPartOne.push({ id: domId.horizon(a.signal.id), label: `${who}: time horizon not selected` });
    if (a.approachLength < APPROACH_FIELD.min) {
      missingPartOne.push({
        id: domId.approach(a.signal.id),
        label: `${who}: improvement approach is ${a.approachLength} characters, needs at least ${APPROACH_FIELD.min}`,
      });
    }
  }

  const missingPartTwo: MissingItem[] = [];
  if (!allPredicted) {
    const unset = totalCells - totalPredicted;
    missingPartTwo.push({
      id: domId.predictGrid,
      label: `Prediction grid — ${unset} of ${totalCells} cells not set`,
    });
  }
  if (!revealedAll) {
    missingPartTwo.push({ id: domId.revealAction, label: "Reveal the model profile" });
  }
  if (!chosen) missingPartTwo.push({ id: domId.chosen, label: "Prioritised option not selected" });
  if (justificationLength < COMMIT.justification.min) {
    missingPartTwo.push({
      id: domId.justification,
      label: `Justification is ${justificationLength} characters, needs at least ${COMMIT.justification.min}`,
    });
  }
  ([1, 2] as const).forEach((n) => {
    if (!followUps[n - 1].trim()) missingPartTwo.push({ id: domId.followUp(n), label: `Follow-up decision ${n} is empty` });
  });
  ([1, 2] as const).forEach((n) => {
    if (!risks[n - 1].trim()) {
      missingPartTwo.push({
        id: domId.risk(n),
        label: riskTarget
          ? `Risk ${n} for Option ${riskTarget.option} is empty`
          : `Risk ${n} is empty — predict Innovation benefit and Feasibility for all three options first so the option can be identified`,
      });
    }
  });

  const missing: MissingItem[] = [
    ...(name.trim() ? [] : [{ id: domId.name, label: "Participant name not entered — export filename will be incomplete" }]),
    ...missingPartOne,
    ...missingPartTwo,
  ];

  return {
    hydrated,
    name,
    mentorSample: !!checks[R1.mentorSample],

    // Step 1
    triage,
    triageById,
    triageCompleteCount,
    triageSignature,
    triageChecks,
    triageFresh,
    triageLastOk,
    triageAllHold,
    triageClue,
    triageRevealed,
    triageRevealAt,
    triageReasoningVisible,
    totalSignals: SIGNALS.length,
    tally,

    // Step 2
    escalated,
    escalatedSignals,
    escalateWhy,

    // Step 3
    analyses,
    analysisById,
    analysisCompleteCount,
    zoneName: (id: ZoneId | null) => (id ? zoneById(id).name : "— not assigned"),

    // Part 2
    optionStates,
    optionStateById,
    totalPredicted,
    totalCells,
    allPredicted,
    revealedAll,
    gapCells,
    missedCells,
    chosen,
    justification,
    justificationLength,
    justificationSignals,
    followUps,
    risks,
    riskTarget,

    // Route-wide
    missingPartOne,
    missingPartTwo,
    missing,
    allComplete: missing.length === 0,
  };
}

export type Route1State = ReturnType<typeof useRoute1>;
