/**
 * S6 — The 7-criteria decision lens. The criteria themselves (definition,
 * diagnostic question, misuse) live in partTwo.ts, so the table taught here
 * and the matrix used in Part 2 can never drift apart.
 */

import type { MaterialSection } from "@/lib/materialSection";
import type { MaterialSectionId } from "../sections";
import type { CriterionId, Rank } from "../partTwo";

/** SVG #10 demo: one illustrative option profiled in buckets, then cleared. */
export const LENS_DEMO: { label: string; note: string; ranks: Record<CriterionId, Rank> } = {
  label: "Example option — a building-management sensor pilot",
  note: "Illustrative buckets, filled in once and then cleared. Rank 1 in the source data shows as High.",
  ranks: {
    leverage: 2,
    sustainability: 2,
    innovation: 1,
    feasibility: 1,
    risk: 2,
    longterm: 3,
    controllability: 1,
  },
};

export const LENS_STATUS =
  "This lens is an applied prioritisation practice used in enterprise architecture and investment governance — a structured decision aid, not a certified standard.";

export const S6_LENS: MaterialSection<MaterialSectionId> = {
  id: "lens",
  code: "S6",
  n: 6,
  icon: "target",
  kicker: "S6 · The tool you use in Part 2",
  title: "The 7-criteria decision lens",
  standfirst:
    "Seven criteria, seven diagnostic questions, seven common misuses — and no option that should rate High on all of them.",
  minutes: 22,
  definition:
    "The 7-criteria decision lens is a structured way to compare options that compete for one budget: strategic leverage, sustainability impact, innovation benefit, feasibility, risk, long-term effect and controllability. Each criterion has a definition, a diagnostic question that turns it into something you can answer, and a common misuse that makes it look answered when it is not. It is an applied prioritisation practice used in enterprise architecture and investment governance — a structured decision aid, not a certified standard.",
  insight:
    "The lens is useful precisely because the criteria conflict. The option with the most visible innovation benefit is rarely the one with the lowest exposure if assumptions prove wrong; the option with the best long-term effect is rarely the quickest to execute. A decision that seems to win on every criterion has usually been assessed through one of the misuses — budget size mistaken for leverage, a vendor's view mistaken for feasibility, a dashboard mistaken for controllability.",
  takeaway:
    "Use the diagnostic questions, not the labels. Rank the options against each criterion separately, and expect no option to come first on all seven. Then treat any summary of your ranks as exactly that — a summary of your own judgement, which still has to be weighted and defended.",
  body: [
    {
      heading: "Seven criteria, seven diagnostic questions",
      paragraphs: [
        "Strategic leverage is how many downstream decisions an option improves — what it makes easier that the organisation will have to do anyway; it is misused when confused with the size of the budget. Sustainability impact is the effect on energy, emissions and lifecycle burden across the boundary you declared; it is misused when counted without a boundary. Innovation benefit is new capability that creates real business options — which department can do something new on Monday; it is misused when equated with the novelty of the technology.",
        "Feasibility asks whether an option can be executed with current budget, skills and organisational capacity — who executes it, and what they stop doing; it is misused when assessed by the vendor rather than by operations. Risk is the exposure if assumptions prove wrong — what breaks if the traffic forecast is wrong by a factor of two; it is misused when reduced to technical risk. Long-term effect asks whether the benefit persists after the project ends — does it still help in year four; it is misused when confused with project duration. Controllability asks whether the result can be measured, steered and reversed — how would we know it failed, and could we stop it; it is misused when assumed because a dashboard exists.",
      ],
    },
    {
      heading: "Judging in buckets, not sliders",
      paragraphs: [
        "Scores on a scale invite false precision: a 7 and an 8 look like a measurement when they are a judgement. The grid you fill in Part 2 asks something coarser and more honest — for each criterion, is each option Low, Mid or High? Coarse buckets keep the judgement visible without pretending to a precision the assessment doesn't have. On every criterion, High means the strongest option; for Risk, the strongest option is the one with the least exposure if your assumptions prove wrong.",
        "The grid reveals all at once against the model profile it's compared to, and every gap between your buckets and the model is explained cell by cell. Neither the grid nor the gap summary is a score of correctness — both are a mirror held up to your own judgement. A cell that matches the model does not automatically mean the right choice, because the seven criteria are not equally important in every situation — and deciding their weight is the part of the decision you own.",
      ],
    },
    {
      heading: "What the lens is, and is not",
      paragraphs: [
        "Multi-criteria comparison is everyday practice in enterprise architecture and investment governance, wherever competing proposals must be put side by side before a portfolio decision. This set of seven is an applied practice tuned to connected infrastructure. Use it as a disciplined aid to judgement — it is not an ISO standard and not a certification requirement, and nobody should present it as one.",
      ],
    },
  ],
  reasoning: [
    "Judge each cell of the Part 2 grid against that row's diagnostic question, not its label — the questions are what separate a real assessment from one of the misuses.",
    "High always means the strongest option on that criterion. For Risk, that is the option with the least exposure if your assumptions prove wrong — not the one with the most proven technology.",
    "If one option is rated High on all seven criteria, one of the misuses is at work. Re-read your Risk and Feasibility cells against the stated budget constraint.",
  ],
  callout: {
    label: "Not a certified standard",
    text: "The 7-criteria lens structures judgement; it does not replace it. A rank sum summarises your judgement — it never certifies it.",
  },
  references: [
    {
      label: "Applied prioritisation practice — enterprise architecture and investment governance",
      detail: "Multi-criteria comparison of competing proposals before a portfolio decision. A decision aid, not a standard.",
    },
    {
      label: "ETSI ES 203 228 V1.3.1 (2020-10)",
      detail: "The boundary logic behind the Sustainability impact question: over what perimeter, compared to what?",
    },
  ],
};
