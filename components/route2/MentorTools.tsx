"use client";

import { useState } from "react";
import { useProgress } from "@/lib/store";
import { MentorFillButton } from "@/components/ui/MentorFillButton";
import { AnswerKeyButton } from "@/components/ui/AnswerKeyButton";
import { R2, R2_KEY_PREFIXES, RESPONSIBILITIES, ROLES } from "@/lib/route2";
import { serialiseCriteriaOrder } from "./ranking";
import { serialiseLinks } from "./tradeoffs";

/**
 * Route 2's mentor bar (§11): one demo fill for material read-state and the
 * whole task, the answer key, and "Reset to empty" behind the shared
 * passcode. The fill is deliberately senior-consultant-grade but imperfect —
 * first measure A, not NetSphere's E, so the instructor can show a
 * well-argued non-NetSphere answer scoring well.
 */

/** One defensible grid, per role id — CIO is the accountable owner throughout. */
const DEMO_RACI: Record<string, Record<string, string>> = {
  defineCriteria: { cio: "A", cto: "R", operations: "C", board: "I" },
  approve: { cio: "A", cto: "C", departments: "C", finance: "C" },
  measure: { cto: "A", cio: "C", operations: "R" },
  review: { board: "A", cio: "R", cto: "C" },
};

export function MentorTools() {
  const setNote = useProgress((s) => s.setNote);
  const choose = useProgress((s) => s.choose);
  const toggleCheck = useProgress((s) => s.toggleCheck);
  const resetPrefixes = useProgress((s) => s.resetPrefixes);
  const [confirmReset, setConfirmReset] = useState(false);

  const fill = () => {
    setNote(R2.name, "Muchson");
    toggleCheck(R2.mentorSample, true);

    // Material: mark all six hotspots read.
    for (const id of ["h1", "h2", "h3", "h4", "h5", "h6"]) toggleCheck(R2.hotspotRead(id), true);

    // Exercise 1a — strategic relevance
    for (const id of ["irreversibility", "cost", "dataGovernance"]) toggleCheck(R2.relevance(id), true);
    setNote(
      R2.relevanceRationale,
      "Investment irreversibility matters because Vertex's uneven estate and its already-deployed IoT pilot fleet are both multi-year commitments that are hard to unwind. Operating cost exposure matters because the pilot fleet has no defined support period. Data governance matters because nobody currently owns the streams the new devices and radios will produce.",
    );

    // Exercise 1c — three guiding decisions
    setNote(R2.guidingText(1), "No connected device is approved without a defined support period and a named lifecycle owner.");
    choose(R2.guidingOwner(1), "cio");
    choose(R2.guidingQuarter(1), "Q1");
    setNote(R2.guidingText(2), "The existing approval gate is made binding: no connectivity spend proceeds without sign-off against the criteria.");
    choose(R2.guidingOwner(2), "board");
    choose(R2.guidingQuarter(2), "Q1");
    setNote(R2.guidingText(3), "Every 5G use case is qualified against an evidenced-requirement test before further site work proceeds.");
    choose(R2.guidingOwner(3), "cto");
    choose(R2.guidingQuarter(3), "Q2");

    // Exercise 1b — decision logic
    setNote(R2.criteriaRank, serialiseCriteriaOrder(["controllability", "leverage", "sustainability"]));
    setNote(
      R2.boundary,
      "Compared to Vertex's current baseline, measured across all five sites over the next financial year, with the two already-modernised sites reported separately from the three that are not.",
    );

    // Exercise 2 — trade-off map: q1 = cost, q2 = friction (who pays vs who benefits)
    setNote(
      R2.tradeOffs,
      serialiseLinks([
        {
          a: "innovation",
          b: "controllability",
          note: "Qualifying every 5G use case slows the visible rollout departments want, in exchange for knowing which ones are worth the spend.",
          q1: "yes",
          q2: "yes",
        },
        {
          a: "dataGrowth",
          b: "complexity",
          note: "Leaving the pilot fleet's telemetry running as-is avoids a migration now, at the cost of a monitoring surface nobody has sized.",
          q1: "yes",
          q2: "no",
        },
      ]),
    );

    // Exercise 4a — first measure (A, not E)
    choose(R2.firstMeasure, "A");
    setNote(
      R2.justification,
      "We recommend making Vertex's existing approval gate binding rather than building a new framework from scratch. This assumes the current criteria draft is broadly workable once someone can actually enforce it, which is plausible given two departments already reference it informally. If, by the end of Q2, fewer than half of new connectivity proposals have been assessed against the gate, we revise and escalate to a fuller governance rebuild. The cost of being wrong is bounded because enforcing an existing process costs no new tooling or headcount — only the CIO's standing decision to say no. This does not stop the two departments' committed budget: their in-flight work continues, and is retro-checked against the criteria at the next stage gate rather than halted, while the one evidenced 5G use case proceeds and the other three are qualified before further spend.",
    );
    setNote(
      R2.committedBudget,
      "In-flight work under the two committed budgets continues without interruption; each is retro-checked against the new criteria at its next natural stage gate rather than stopped, so the financial year's commitments are honoured while the criteria still apply going forward.",
    );

    // Exercise 3 — governance
    for (const resp of RESPONSIBILITIES) {
      for (const role of ROLES) {
        const v = DEMO_RACI[resp.id]?.[role.id];
        if (v) choose(R2.raci(resp.id, role.id), v);
      }
    }
    setNote(R2.reviewMechanism, "A quarterly infrastructure governance review, chaired by the CIO, examining the count of proposals refused or amended at the gate and the pilot fleet's support-period status.");

    // Section 7
    setNote(R2.decisionNow, "Despite incomplete data on the pilot fleet's full device count, we decide now to freeze further IoT pilot expansion until a support period is defined, rather than wait for a complete inventory.");
    choose(R2.confidence, "65");
    setNote(R2.changeMyMind, "If the supplier confirms a support period within 30 days, the freeze lifts immediately and the pilot resumes under the new criteria.");

    // Self-assessment — not all "Yes"
    choose(R2.selfAssess("problemType"), "yes");
    choose(R2.selfAssess("firstMeasure"), "yes");
    choose(R2.selfAssess("connected"), "partly");
    choose(R2.selfAssess("actionCapable"), "yes");
    choose(R2.selfAssess("separated"), "yes");
  };

  const reset = () => {
    resetPrefixes(R2_KEY_PREFIXES);
    setConfirmReset(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
      <MentorFillButton onFill={fill} />
      <AnswerKeyButton />
      {!confirmReset ? (
        <button type="button" onClick={() => setConfirmReset(true)} className="rounded-full border border-dashed border-line px-3 py-1 text-micro font-semibold text-ash transition-colors duration-150 hover:border-ash hover:text-ink">
          Reset to empty
        </button>
      ) : (
        <span className="flex items-center gap-2 rounded-full border border-danger/40 bg-danger/5 px-2 py-1">
          <span className="text-micro text-danger">Clear every answer on this route?</span>
          <button type="button" onClick={reset} className="text-micro font-semibold text-danger underline underline-offset-2">
            Yes, clear it
          </button>
          <button type="button" onClick={() => setConfirmReset(false)} className="text-micro text-ash hover:text-ink">
            Cancel
          </button>
        </span>
      )}
    </div>
  );
}
