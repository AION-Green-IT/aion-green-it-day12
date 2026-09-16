"use client";

import { useProgress, useHydrated } from "@/lib/store";
import type { MissingItem } from "@/components/ui/MissingList";
import {
  MEMO_SECTIONS,
  QUARTERS,
  R2,
  RANK_SLOTS,
  RELEVANCE_DRIVERS,
  RELEVANCE_REQUIRED,
  RESPONSIBILITIES,
  ROLES,
  SECTION_1,
  SECTION_3,
  SECTION_5,
  SECTION_6,
  SECTION_7,
  SELF_ASSESSMENT_ITEMS,
  TRADEOFF_MIN,
  factorLabel,
  isFactorId,
  isOptionId,
  isQuarter,
  isRoleId,
  isSelfAssessmentValue,
  tradeoffQuadrantFor,
  type OptionId,
  type Quarter,
  type RelevanceId,
  type ResponsibilityId,
  type RoleId,
  type SelfAssessmentValue,
  type TradeoffQuadrantId,
} from "@/lib/route2";
import type { RaciCell } from "@/components/ui/RaciGrid";
import { validate as validateRaci } from "@/components/ui/RaciGrid";
import { parseCriteriaOrder } from "./ranking";
import { parseLinks, type TradeOffLink } from "./tradeoffs";

/**
 * DOM ids the missing list, clues and reference chips scroll to. Phase 3
 * folds nine section containers into four exercise containers — the KEYS
 * below are unchanged from the nine-section version (so clues.ts,
 * ExportBar.tsx and MemoPreview.tsx, which all address these fields by name,
 * needed no edits), only the underlying string VALUES now nest under the new
 * r2-ex1..r2-ex4 containers.
 */
export const domId = {
  name: "r2-name",
  task: "r2-task",

  // Exercise 1 — Prioritize (was: Relevance + Guiding decisions + Decision logic)
  relevance: "r2-ex1-relevance",
  relevanceDriver: "r2-ex1-relevance-drivers",
  relevanceRationale: "r2-ex1-relevance-rationale",
  guiding: "r2-ex1-guiding",
  guidingText: (n: 1 | 2 | 3) => `r2-ex1-guiding-${n}-text`,
  guidingOwner: (n: 1 | 2 | 3) => `r2-ex1-guiding-${n}-owner`,
  guidingQuarter: (n: 1 | 2 | 3) => `r2-ex1-guiding-${n}-quarter`,
  logic: "r2-ex1-logic",
  criteriaRank: "r2-ex1-logic-rank",
  boundary: "r2-ex1-logic-boundary",

  // Exercise 2 — The trade-off map (was: Trade-offs + TensionPicker)
  tradeoffs: "r2-ex2",
  tradeoffPair: (a: string, b: string) => `r2-ex2-${a}-${b}`,
  tradeoffQ1: (a: string, b: string) => `r2-ex2-${a}-${b}-q1`,
  tradeoffQ2: (a: string, b: string) => `r2-ex2-${a}-${b}-q2`,
  tradeoffNote: (a: string, b: string) => `r2-ex2-${a}-${b}-note`,

  // Exercise 3 — Governance (was: Governance)
  governance: "r2-ex3",
  raciRow: (id: string) => `r2-ex3-row-${id}`,
  reviewMechanism: "r2-ex3-review",

  // Exercise 4 — Decide now (was: First measure + Decide now + Check memo + Self-assessment)
  decideNow: "r2-ex4",
  measure: "r2-ex4-measure",
  firstMeasure: "r2-ex4-measure-option",
  justification: "r2-ex4-measure-justification",
  committedBudget: "r2-ex4-measure-budget",
  decisionNow: "r2-ex4-decision",
  confidence: "r2-ex4-confidence",
  changeMyMind: "r2-ex4-changemymind",
  checkMemo: "r2-ex4-check",
  selfAssessment: "r2-ex4-selfassessment",

  memo: "r2-memo",
  memoSection: (n: number) => `r2-memo-${n}`,

  export: "r2-export",
};

const NO_STRINGS: Record<string, string> = {};
const NO_BOOLS: Record<string, boolean> = {};

export type GuidingDecision = { text: string; owner: RoleId | null; quarter: Quarter | null };

export type TradeoffPairState = {
  link: TradeOffLink;
  /** Derived from the two diagnostic answers — never chosen directly. Null while either answer is missing. */
  quadrant: TradeoffQuadrantId | null;
  /** Position among the pairs sharing this quadrant, for the map layout. */
  slotIndex: number;
  slotCount: number;
};

/**
 * Joins the shared progress store to Route 2's content — the material's
 * read/opened state and the whole task, one hook. Until the store has
 * hydrated it reads as empty, matching the statically exported HTML (Route
 * 1's useRoute1 does the same, for the same hydration-safety reason).
 *
 * Phase 3 note: every field this hook returns keeps its Phase-2 name. Only
 * the *component* that reads each field changed (nine section components →
 * four exercise components) — the state shape underneath, and therefore
 * MemoPreview.tsx and exportDocuments.ts which read it, did not need to
 * change at all.
 */
export function useRoute2() {
  const hydrated = useHydrated();
  const rawNotes = useProgress((s) => s.notes);
  const rawChoices = useProgress((s) => s.choices);
  const rawChecks = useProgress((s) => s.checks);
  const choose = useProgress((s) => s.choose);

  const notes = hydrated ? rawNotes : NO_STRINGS;
  const choices = hydrated ? rawChoices : NO_STRINGS;
  const checks = hydrated ? rawChecks : NO_BOOLS;

  const name = notes[R2.name] ?? "";
  const mentorSample = !!checks[R2.mentorSample];

  // -- Material ---------------------------------------------------------------
  const hotspotsRead = ["h1", "h2", "h3", "h4", "h5", "h6"].filter((id) => checks[R2.hotspotRead(id)]).length;

  // -- Exercise 1a: strategic relevance ----------------------------------------
  const relevanceSelected = RELEVANCE_DRIVERS.map((d) => d.id).filter((id) => checks[R2.relevance(id)]) as RelevanceId[];
  const relevanceRationale = notes[R2.relevanceRationale] ?? "";

  // -- Exercise 1b: guiding decisions -------------------------------------------
  const guidingDecisions: GuidingDecision[] = ([1, 2, 3] as const).map((n) => {
    const owner = choices[R2.guidingOwner(n)];
    const quarter = choices[R2.guidingQuarter(n)];
    return {
      text: notes[R2.guidingText(n)] ?? "",
      owner: isRoleId(owner) ? owner : null,
      quarter: isQuarter(quarter) ? quarter : null,
    };
  });

  // -- Exercise 1c: decision logic -----------------------------------------------
  const criteriaOrder = parseCriteriaOrder(notes[R2.criteriaRank]);
  const boundary = notes[R2.boundary] ?? "";

  // -- Exercise 2: the trade-off map ---------------------------------------------
  const tradeOffLinks = parseLinks(notes[R2.tradeOffs]);
  const rawPendingLink = choices[R2.pendingLink];
  const pendingLink = isFactorId(rawPendingLink) ? rawPendingLink : null;

  const tradeoffBase = tradeOffLinks.map((link) => ({
    link,
    quadrant: link.q1 && link.q2 ? tradeoffQuadrantFor(link.q1 === "yes", link.q2 === "yes") : null,
  }));
  const tradeoffStates: TradeoffPairState[] = tradeoffBase.map((s) => {
    const sharing = tradeoffBase.filter((o) => o.quadrant !== null && o.quadrant === s.quadrant);
    return {
      ...s,
      slotIndex: s.quadrant ? sharing.findIndex((o) => o.link.a === s.link.a && o.link.b === s.link.b) : 0,
      slotCount: s.quadrant ? sharing.length : 0,
    };
  });
  const placedTradeoffCount = tradeoffStates.filter((s) => s.quadrant).length;

  // -- Exercise 4a: first measure -------------------------------------------------
  const rawMeasure = choices[R2.firstMeasure];
  const firstMeasure: OptionId | null = isOptionId(rawMeasure) ? rawMeasure : null;
  const justification = notes[R2.justification] ?? "";
  const committedBudgetAnswer = notes[R2.committedBudget] ?? "";

  // -- Exercise 3: governance --------------------------------------------------------
  const raciValue = (responsibilityId: string, roleId: string): RaciCell => {
    const v = choices[R2.raci(responsibilityId, roleId)];
    return v === "R" || v === "A" || v === "C" || v === "I" ? v : "";
  };
  const raciRoles = ROLES.map((r) => ({ id: r.id, name: r.label, short: r.label.split(" ")[0], canBindCapacity: true }));
  const raciViolations = validateRaci(RESPONSIBILITIES, raciRoles, raciValue, [], {
    manyA: "More than one Accountable in this row.",
    noA: "No Accountable in this row.",
    noR: "No Responsible in this row.",
    authority: "",
  });
  const raciTouched = (id: string) => ROLES.some((r) => raciValue(id, r.id) !== "");
  const reviewMechanism = notes[R2.reviewMechanism] ?? "";

  // -- Exercise 4b: decide now -------------------------------------------------------
  const decisionNow = notes[R2.decisionNow] ?? "";
  // Confidence has no "unset" state — 0 is itself a meaningful reading, unlike
  // Route 1's 1..N predict sliders where 0 means "not touched". It is also not
  // a required field (never listed in `missing`), so it simply defaults to a midpoint.
  const confidence = Number(choices[R2.confidence] ?? "50") || 0;
  const changeMyMind = notes[R2.changeMyMind] ?? "";

  // -- Self-assessment (never validated) -------------------------------------------
  const selfAssessment = Object.fromEntries(
    SELF_ASSESSMENT_ITEMS.map((item) => {
      const v = choices[R2.selfAssess(item.id)];
      return [item.id, isSelfAssessmentValue(v) ? v : null];
    }),
  ) as Record<string, SelfAssessmentValue | null>;

  // -- Memo section "drafted" state, for the live preview's placeholders ------------
  const drafted = {
    1: relevanceRationale.trim().length > 0 || !!firstMeasure, // executive summary composes from both
    2: relevanceSelected.length > 0 && relevanceRationale.trim().length > 0,
    3: guidingDecisions.some((g) => g.text.trim()),
    4: criteriaOrder.length > 0 || boundary.trim().length > 0,
    5: tradeOffLinks.length > 0,
    6: !!firstMeasure && justification.trim().length > 0,
    7: RESPONSIBILITIES.some((r) => raciTouched(r.id)) || reviewMechanism.trim().length > 0,
    8: decisionNow.trim().length > 0,
  } as Record<number, boolean>;

  // -- Missing list (standard #1: one entry per concrete gap, in page order) -------
  const missing: MissingItem[] = [];

  if (!name.trim()) missing.push({ id: domId.name, label: "Participant name not entered — export filename will be incomplete" });

  if (relevanceSelected.length !== RELEVANCE_REQUIRED) {
    missing.push({ id: domId.relevanceDriver, label: `Exercise 1 — Strategic relevance: ${relevanceSelected.length} of ${RELEVANCE_REQUIRED} drivers selected` });
  }
  if (relevanceRationale.trim().length < SECTION_1.rationale.min) {
    missing.push({ id: domId.relevanceRationale, label: `Exercise 1 — Rationale is ${relevanceRationale.trim().length} characters, needs at least ${SECTION_1.rationale.min}` });
  }

  if (criteriaOrder.length < RANK_SLOTS) {
    missing.push({ id: domId.criteriaRank, label: `Exercise 1 — Decision-logic ranking incomplete (${criteriaOrder.length} of ${RANK_SLOTS} placed)` });
  }
  if (boundary.trim().length < SECTION_3.boundary.min) {
    missing.push({ id: domId.boundary, label: "Exercise 1 — Assessment boundary not stated" });
  }

  guidingDecisions.forEach((g, i) => {
    const n = i + 1;
    if (!g.text.trim()) missing.push({ id: domId.guidingText(n as 1 | 2 | 3), label: `Exercise 1 — Guiding decision ${n}: text empty` });
    if (!g.owner) missing.push({ id: domId.guidingOwner(n as 1 | 2 | 3), label: `Exercise 1 — Guiding decision ${n}: owner not assigned` });
    if (!g.quarter) missing.push({ id: domId.guidingQuarter(n as 1 | 2 | 3), label: `Exercise 1 — Guiding decision ${n}: quarter not assigned` });
  });

  if (tradeOffLinks.length < TRADEOFF_MIN) {
    missing.push({ id: domId.tradeoffs, label: `Exercise 2 — Only ${tradeOffLinks.length} trade-off pair drawn, at least ${TRADEOFF_MIN} required` });
  }
  for (const s of tradeoffStates) {
    const short = `${factorLabel(s.link.a)} ↔ ${factorLabel(s.link.b)}`;
    if (!s.link.q1) {
      missing.push({ id: domId.tradeoffQ1(s.link.a, s.link.b), label: `Exercise 2 — "${short}": cost question not answered` });
    }
    if (!s.link.q2) {
      missing.push({ id: domId.tradeoffQ2(s.link.a, s.link.b), label: `Exercise 2 — "${short}": friction question not answered` });
    }
    if (!s.link.note.trim()) {
      missing.push({ id: domId.tradeoffNote(s.link.a, s.link.b), label: `Exercise 2 — "${short}": note empty` });
    }
  }

  for (const resp of RESPONSIBILITIES) {
    const accountable = ROLES.filter((r) => raciValue(resp.id, r.id) === "A");
    if (accountable.length !== 1) {
      missing.push({
        id: domId.raciRow(resp.id),
        label: `Exercise 3 — Responsibility "${resp.label}": ${accountable.length === 0 ? "no accountable role assigned" : "more than one accountable role assigned"}`,
      });
    }
  }
  if (reviewMechanism.trim().length < SECTION_6.review.min) {
    missing.push({ id: domId.reviewMechanism, label: "Exercise 3 — Review mechanism not described" });
  }

  if (!firstMeasure) missing.push({ id: domId.firstMeasure, label: "Exercise 4 — First measure not selected" });
  if (justification.trim().length < SECTION_5.justification.min) {
    missing.push({ id: domId.justification, label: `Exercise 4 — Justification is ${justification.trim().length} characters, needs at least ${SECTION_5.justification.min}` });
  }
  if (committedBudgetAnswer.trim().length < SECTION_5.budgetQuestion.min) {
    missing.push({ id: domId.committedBudget, label: "Exercise 4 — Committed-budget question not answered" });
  }

  if (decisionNow.trim().length < SECTION_7.decision.min) {
    missing.push({ id: domId.decisionNow, label: `Exercise 4 — Decision under uncertainty is ${decisionNow.trim().length} characters, needs at least ${SECTION_7.decision.min}` });
  }
  if (!changeMyMind.trim()) {
    missing.push({ id: domId.changeMyMind, label: 'Exercise 4 — "What would change your mind?" is empty' });
  }

  return {
    hydrated,
    name,
    mentorSample,
    hotspotsRead,

    relevanceSelected,
    relevanceRationale,
    guidingDecisions,
    criteriaOrder,
    boundary,
    tradeOffLinks,
    pendingLink,
    tradeoffStates,
    placedTradeoffCount,
    firstMeasure,
    justification,
    committedBudgetAnswer,
    raciValue,
    raciRoles,
    raciViolations,
    raciTouched,
    reviewMechanism,
    decisionNow,
    confidence,
    changeMyMind,
    selfAssessment,
    drafted,
    memoSections: MEMO_SECTIONS,
    quarters: QUARTERS,

    missing,
    allComplete: missing.length === 0,

    choose,
  };
}

export type Route2State = ReturnType<typeof useRoute2>;
