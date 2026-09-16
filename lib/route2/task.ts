/**
 * The Level 3 task — "Board Memo Builder" for Vertex Connected Industries.
 * Seven input sections, a live split-screen memo preview, check-on-demand,
 * a self-assessment, and one export.
 *
 * §6's critical design constraint governs every Vertex-specific fact here:
 * NetSphere's answer must remain defensible but not automatic. See each
 * field's data for where that shows up (VERTEX_SPECIFIC, the five options,
 * the clue rules in ../../components/route2/clues.ts).
 */

import type { AnswerKeyBlock } from "@/lib/answerKey";
import type { MaterialSectionId } from "./sections";

// ---------------------------------------------------------------------------
// The brief
// ---------------------------------------------------------------------------

export const VERTEX = {
  company: "Vertex Connected Industries",
  role: "Head of Infrastructure & Connectivity Strategy — CIO/CTO advisor",
  heading: "The brief",
  paragraphs: [
    "You are the head of infrastructure and connectivity strategy — CIO/CTO advisor — for Vertex Connected Industries. Vertex is expanding connected infrastructure across several business areas and wants innovation capacity, efficiency and sustainability at the same time. There are no binding criteria for how networks, IoT devices, 5G applications and data streams should be prioritised for long-term manageability.",
    "Management has asked for a decision-ready proposal. Not a list of technology ideas — a decision architecture.",
  ],
  warning: "NetSphere's answer is not Vertex's answer. Read the conditions before you reuse the pattern.",
};

export const VERTEX_GENERAL_CONDITIONS = [
  "High innovation and digitalisation pressure across several departments.",
  "Conflicting interests: operations, IT, business departments, finance, management.",
  "Incomplete transparency on energy demand, data benefit and lifecycle impact.",
  "Budget restrictions alongside an expectation of visible innovation progress.",
  "Risk that connectivity is judged as progress across the board and structurally overrated.",
  "Growing requirements for operational reliability, scalability and governance.",
];

export type VertexSpecificId = "approval" | "estate" | "fiveg" | "pilot" | "budget";

export const VERTEX_SPECIFIC: { id: VertexSpecificId; text: string }[] = [
  { id: "approval", text: "An approval process exists on paper but is not used; two departments hold conflicting mandates." },
  { id: "estate", text: "The network estate is uneven — two of five sites modernised recently, three not." },
  { id: "fiveg", text: "One 5G use case has an evidenced latency requirement; three others do not." },
  { id: "pilot", text: "An IoT pilot fleet is already deployed with no defined support period." },
  { id: "budget", text: "Two departments have already committed budget in the current financial year." },
];

export const VERTEX_SPECIFIC_HEADING = "What is specific to Vertex";

// ---------------------------------------------------------------------------
// Section 1 — Strategic relevance
// ---------------------------------------------------------------------------

export type RelevanceId =
  | "cost"
  | "compliance"
  | "reliability"
  | "irreversibility"
  | "innovation"
  | "supplyChain"
  | "dataGovernance";

export const RELEVANCE_DRIVERS: { id: RelevanceId; label: string }[] = [
  { id: "cost", label: "Operating cost exposure" },
  { id: "compliance", label: "Compliance and reporting obligation" },
  { id: "reliability", label: "Operational reliability" },
  { id: "irreversibility", label: "Investment irreversibility" },
  { id: "innovation", label: "Innovation capability" },
  { id: "supplyChain", label: "Supply chain and lifecycle risk" },
  { id: "dataGovernance", label: "Data governance" },
];

export const RELEVANCE_REQUIRED = 3;

export const relevanceLabel = (id: RelevanceId) => RELEVANCE_DRIVERS.find((d) => d.id === id)!.label;

export const SECTION_1 = {
  n: 1,
  title: "Strategic relevance",
  instruction: `Choose exactly ${RELEVANCE_REQUIRED} of the seven drivers below.`,
  helper: "Relevance is not why the topic matters in general — it is why it matters to Vertex this year.",
  rationale: {
    label: "Why these three, for this company?",
    min: 150,
    placeholder: "We selected these three because, at Vertex specifically…",
  },
};

// ---------------------------------------------------------------------------
// Section 2 — Three guiding decisions
// ---------------------------------------------------------------------------

export type RoleId = "board" | "cio" | "cto" | "operations" | "finance" | "departments";

export const ROLES: { id: RoleId; label: string }[] = [
  { id: "board", label: "Management board" },
  { id: "cio", label: "CIO" },
  { id: "cto", label: "CTO" },
  { id: "operations", label: "Head of Operations" },
  { id: "finance", label: "Finance" },
  { id: "departments", label: "Department heads" },
];

export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
export const QUARTERS: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];
export const isQuarter = (v: string | undefined): v is Quarter => !!v && QUARTERS.includes(v as Quarter);
export const isRoleId = (v: string | undefined): v is RoleId => !!v && ROLES.some((r) => r.id === v);

export const SECTION_2 = {
  n: 2,
  title: "Three guiding decisions for the next 12 months",
  helper: "A guiding decision is one that constrains later decisions. 'Buy sensors' is a purchase. 'No connected device is approved without a defined support period' is a guiding decision.",
  count: 3,
  placeholder: (n: number) => `Guiding decision ${n}…`,
};

// ---------------------------------------------------------------------------
// Section 3 — Decision logic (self-contained 7-criteria set)
// ---------------------------------------------------------------------------

export type CriterionId = "leverage" | "sustainability" | "innovation" | "feasibility" | "risk" | "longterm" | "controllability";

export type Criterion = { id: CriterionId; name: string; definition: string };

/**
 * The same seven criterion names Route 1 teaches in full (S6) — repeated here
 * with their own definitions per §13's self-containment rule, so a learner who
 * starts at Route 2 is not disadvantaged. Deliberately not imported from
 * lib/route1: that module is tied to Route 1's A/B/C options and is a
 * dependency this route must not carry.
 */
export const CRITERIA: Criterion[] = [
  { id: "leverage", name: "Strategic leverage", definition: "How many downstream decisions this option improves." },
  { id: "sustainability", name: "Sustainability impact", definition: "Effect on energy, emissions and lifecycle burden across the boundary you declare." },
  { id: "innovation", name: "Innovation benefit", definition: "New capability that creates real business options." },
  { id: "feasibility", name: "Feasibility", definition: "Can be executed with current budget, skills and organisational capacity." },
  { id: "risk", name: "Risk", definition: "Exposure if assumptions prove wrong." },
  { id: "longterm", name: "Long-term effect", definition: "Whether the benefit persists after the project ends." },
  { id: "controllability", name: "Controllability", definition: "Whether the result can be measured, steered and reversed." },
];

export const criterionById = (id: CriterionId) => CRITERIA.find((c) => c.id === id)!;

export const RANK_SLOTS = 3;

export const SECTION_3 = {
  n: 3,
  title: "Decision logic",
  instruction: `Rank the top ${RANK_SLOTS} criteria you would apply to Vertex's decision, in order. Drag to reorder, or use the rank selector.`,
  boundary: {
    label: "What is the boundary?",
    helper: "State the perimeter and the comparison your sustainability assessments will use — 'compared to what, measured over what, for how long'. Without this, criterion 2 cannot be applied.",
    min: 30,
    placeholder: "Compared to Vertex's current baseline, over the five-site network perimeter, measured annually…",
  },
};

// ---------------------------------------------------------------------------
// Section 4 — Central trade-offs (the tension picker)
// ---------------------------------------------------------------------------

export type FactorId = "connectivity" | "innovation" | "energy" | "dataGrowth" | "investment" | "controllability" | "reliability" | "complexity";

export const FACTORS: { id: FactorId; label: string }[] = [
  { id: "connectivity", label: "Connectivity" },
  { id: "innovation", label: "Innovation speed" },
  { id: "energy", label: "Energy demand" },
  { id: "dataGrowth", label: "Data growth" },
  { id: "investment", label: "Investment" },
  { id: "controllability", label: "Controllability" },
  { id: "reliability", label: "Reliability" },
  { id: "complexity", label: "Complexity" },
];

export const factorLabel = (id: FactorId) => FACTORS.find((f) => f.id === id)!.label;
export const isFactorId = (v: string): v is FactorId => FACTORS.some((f) => f.id === v);

export const TRADEOFF_MIN = 2;
export const TRADEOFF_MAX = 3;

export const SECTION_4 = {
  n: 4,
  title: "Central trade-offs",
  instruction: `Draw ${TRADEOFF_MIN}–${TRADEOFF_MAX} links between opposing factors. Click one node, then the node it trades against.`,
  helper: "A trade-off is only real if naming it costs you something. If both sides can be maximised, it is not a trade-off.",
  noteLabel: "What is given up, and who feels it?",
  notePlaceholder: "Naming this trade-off costs…",
};

// ---------------------------------------------------------------------------
// Section 5 — First measure
// ---------------------------------------------------------------------------

export type OptionId = "A" | "B" | "C" | "D" | "E";
export const OPTION_IDS: OptionId[] = ["A", "B", "C", "D", "E"];

export type FirstMeasureOption = { id: OptionId; text: string };

export const FIRST_MEASURE_OPTIONS: FirstMeasureOption[] = [
  { id: "A", text: "Make the existing approval gate binding and enforce criteria before any further commitment." },
  { id: "B", text: "Modernise the three non-modernised sites first." },
  { id: "C", text: "Qualify all planned 5G use cases against an evidenced-requirement test; proceed only with the qualified one." },
  { id: "D", text: "Define lifecycle and support-period criteria and retrofit them onto the deployed IoT pilot fleet." },
  { id: "E", text: "Build a full architecture and governance framework before any further connectivity decision." },
];

export const optionById = (id: OptionId) => FIRST_MEASURE_OPTIONS.find((o) => o.id === id)!;
export const isOptionId = (v: string | undefined): v is OptionId => !!v && OPTION_IDS.includes(v as OptionId);

export const JUSTIFICATION_TEMPLATE =
  "We recommend X. This assumes Y. If [indicator] shows Z by [review point], we revise. The cost of being wrong is bounded because [reversibility].";

export const SECTION_5 = {
  n: 5,
  title: "Recommended first prioritised line of measures",
  justification: { label: "Justification", min: 300, placeholder: "We recommend… This assumes… If… shows… by…, we revise. The cost of being wrong is bounded because…" },
  budgetQuestion: {
    label: "How does this handle the budget already committed by two departments?",
    min: 40,
    placeholder: "The committed work continues under…",
  },
};

// ---------------------------------------------------------------------------
// Section 6 — Governance (RACI)
// ---------------------------------------------------------------------------

export type ResponsibilityId = "defineCriteria" | "approve" | "measure" | "review";

export const RESPONSIBILITIES: { id: ResponsibilityId; label: string }[] = [
  { id: "defineCriteria", label: "Define and maintain criteria" },
  { id: "approve", label: "Approve or refuse connectivity investments" },
  { id: "measure", label: "Measure and report energy and lifecycle effects" },
  { id: "review", label: "Trigger review and revise the framework" },
];

/** RaciGrid's role shape — Route 2's task has no capacity-authority column, so every role reports `canBindCapacity: true` and the grid's `showCapacity` stays off. */
export const GOVERNANCE_ROLES = ROLES.map((r) => ({ id: r.id, name: r.label, short: r.label.split(" ")[0], canBindCapacity: true }));

export const SECTION_6 = {
  n: 6,
  title: "Governance: roles, approval, review",
  helper: "Click a cell to cycle R / A / C / I / blank. Exactly one A per responsibility — a clue appears if that slips.",
  review: {
    label: "Review mechanism",
    helper: "Name the meeting, its frequency, and what evidence it looks at. A review that reads a status slide changes nothing.",
    min: 40,
    placeholder: "A quarterly infrastructure review that examines…",
  },
};

// ---------------------------------------------------------------------------
// Section 7 — The decision to take now
// ---------------------------------------------------------------------------

export const SECTION_7 = {
  n: 7,
  title: "The decision to take now despite incomplete information",
  decision: { label: "The decision", min: 120, placeholder: "Despite incomplete data, we decide now to…" },
  confidence: { label: "Confidence", min: 0, max: 100, helper: "Confidence below 60 is not a weakness — it is a signal that you need the review point named in section 5." },
  changeMyMind: { label: "What would change your mind?", placeholder: "If…" },
};

// ---------------------------------------------------------------------------
// Self-assessment (§8.5) — mirrors the rubric preview, non-blocking
// ---------------------------------------------------------------------------

export type RubricId = "problemType" | "firstMeasure" | "connected" | "actionCapable" | "separated";

export const SELF_ASSESSMENT_ITEMS: { id: RubricId; label: string; section: number }[] = [
  { id: "problemType", label: "Was the core problem identified as a technology, a data or a management question?", section: 1 },
  { id: "firstMeasure", label: "Which first measure was prioritised, and why?", section: 5 },
  { id: "connected", label: "Were network efficiency, IoT lifecycle and 5G meaningfully connected — or treated as three separate topics?", section: 3 },
  { id: "actionCapable", label: "Was the argument action-capable under uncertainty (assumption, falsification, review point)?", section: 5 },
  { id: "separated", label: "Was short-term innovation pressure cleanly separated from long-term structural effect?", section: 7 },
];

export type SelfAssessmentValue = "yes" | "partly" | "not-yet";
export const SELF_ASSESSMENT_VALUES: SelfAssessmentValue[] = ["yes", "partly", "not-yet"];
export const isSelfAssessmentValue = (v: string | undefined): v is SelfAssessmentValue =>
  !!v && SELF_ASSESSMENT_VALUES.includes(v as SelfAssessmentValue);

// ---------------------------------------------------------------------------
// Check-on-demand copy (logic lives in components/route2/clues.ts)
// ---------------------------------------------------------------------------

export const CHECK_MEMO = {
  label: "Check my memo",
  recheckLabel: "Check again",
  lead: "Clues from your own memo",
  clean: "Nothing in your memo contradicts itself on what this check can read. That is not a verdict on the argument itself — read it once more against Vertex's five specific conditions.",
};

// ---------------------------------------------------------------------------
// The memo document structure (§8.2) — section labels for the live preview
// ---------------------------------------------------------------------------

export const MEMO_SECTIONS = [
  { n: 1, title: "Executive summary" },
  { n: 2, title: "Strategic rationale" },
  { n: 3, title: "Guiding decisions, next 12 months" },
  { n: 4, title: "Decision logic and assessment criteria" },
  { n: 5, title: "Central trade-offs" },
  { n: 6, title: "Recommended first measure" },
  { n: 7, title: "Governance: roles, approval, review" },
  { n: 8, title: "Decision taken now under uncertainty" },
];

export const EXPORT = {
  filenameLevels: [3],
  filenameTask: 1,
  schemaVersion: "day12.route2.v1",
  docHeading: "Vertex Board Memo",
  buttonLabel: "Export the Board Memo",
  anywayLabel: "Export anyway (incomplete)",
  incompleteStamp: "STATUS: INCOMPLETE DRAFT",
  mentorStamp: "MENTOR SAMPLE — not participant work",
} as const;

export const TASK_INTRO = {
  tag: "TASK · BOARD MEMO BUILDER",
  title: "Vertex Connected Industries",
  minutes: 20,
  materialRefs: ["management", "dimensions", "levers", "measure", "roadmap"] as MaterialSectionId[],
};

// ---------------------------------------------------------------------------
// Answer key — the commit-equivalent for this task: which first measure, and
// on what grounds.
// ---------------------------------------------------------------------------

export const FIRST_MEASURE_ANSWER_KEY: AnswerKeyBlock = {
  prompt: "Section 5 — which first measure, and on what grounds",
  items: [
    {
      option: "A — Make the existing approval gate binding (curriculum model answer for Vertex)",
      verdict: "pick",
      why: "Vertex already has an approval process on paper; the acute problem is that it is not enforced and two departments hold conflicting mandates. Making the existing gate binding is the cheapest, fastest lever available and directly answers the specific condition — no new structure has to be built, an existing one has to be used.",
    },
    {
      option: "E — Build a full framework (NetSphere's answer — defensible, not automatic here)",
      verdict: "pick",
      why: "Still defensible, and structurally the most complete answer. But it costs more time than A while addressing a governance gap that, unlike NetSphere's, already has a process in place — a learner choosing E must explain why building new is better than enforcing what exists, and must still handle the committed budget and the evidenced 5G use case explicitly.",
    },
    {
      option: "B — Modernise the three non-modernised sites",
      verdict: "avoid",
      why: "A real, targeted lever (section D, lever 2) — but chosen first it repeats NetSphere's dimension-one finding without touching the governance gap that let the uneven estate happen, and it does nothing for the pilot fleet or the unqualified 5G use cases.",
    },
    {
      option: "C — Qualify all 5G use cases",
      verdict: "avoid",
      why: "Necessary and cheap, but narrow — it fixes one of Vertex's five specific conditions and leaves the approval-process, pilot-fleet and estate conditions untouched. A learner choosing C must not imply blanket 5G deprioritisation: one use case is evidenced and should proceed.",
    },
    {
      option: "D — Retrofit lifecycle criteria onto the pilot fleet",
      verdict: "avoid",
      why: "Addresses a real, named exposure (the undefined support period) but is the narrowest of the five — it says nothing about the approval process, the uneven estate or the unqualified 5G use cases.",
    },
  ],
  teachingNote:
    "The point of this task is not that A is secretly 'correct' and E is a trap — both are defensible. What is not defensible is choosing E with a justification that could have been written before reading Vertex's five specific conditions, or choosing any option without an explicit answer to the committed-budget question. Grade the justification's contact with Vertex's specific facts, not the letter chosen.",
};

// ---------------------------------------------------------------------------
// Phase 3 — the task recomposed as four flat exercises (day11's pattern:
// CLAUDE.md #14 / "4 flat exercises"). The seven SECTION_* blocks above keep
// every field, label, option and ground-truth fact exactly as authored; this
// block only adds the framing copy the new exercise components render
// through, plus the trade-off map's quadrant mechanic (Exercise 2 used to be
// a ring of links — see TensionPicker's deletion note — and now needs a
// decide-then-discover placement the way day11's MapExercise works).
// ---------------------------------------------------------------------------

export const EXERCISE_1 = {
  n: 1,
  minutes: 8,
  title: "Prioritize",
  intro:
    "What matters this year, in what order, and who is bound by it. Select the drivers that make this urgent for Vertex specifically, rank the criteria you will judge every later choice against, then commit to three guiding decisions with an owner and a quarter each.",
  material: ["management", "dimensions", "measure", "roadmap"] as MaterialSectionId[],
};

export const EXERCISE_2 = {
  n: 2,
  minutes: 6,
  title: "The trade-off map",
  intro:
    "Pick two opposing factors, then answer two diagnostic questions about that pair. Your answers place it on the map — you never drag it there, because the position is a consequence of what you decide about cost and friction, not a judgement of its own.",
  material: ["management"] as MaterialSectionId[],
};

export const EXERCISE_3 = {
  n: 3,
  minutes: 3,
  title: "Governance",
  intro:
    "Click a cell to cycle it through R, A, C, I and back to blank. The grid checks structure only — exactly one Accountable per row, at least one Responsible. It never tells you who should hold which letter.",
  material: ["levers", "measure"] as MaterialSectionId[],
};

export const EXERCISE_4 = {
  n: 4,
  minutes: 6,
  title: "Decide now",
  intro:
    "Choose the first measure, justify it against Vertex's own conditions, and commit to the one decision that cannot wait for complete data. Check your memo when you are ready — it reads your own answers back for internal consistency, never the grade.",
  material: ["measure"] as MaterialSectionId[],
};

// ---------------------------------------------------------------------------
// Exercise 2's diagnostics — replaces the ring-link picker's single free-text
// "what is given up, and who feels it" note with two structured yes/no
// questions per pair. There is no fixed correct quadrant for a given factor
// pair (unlike day11's MAP_MEASURES, which carry ground truth) — which pair
// is a "real" trade-off for Vertex is the learner's own judgement call, the
// same way day11's RankExercise deliberately does not grade an order because
// "there is no single correct one" (day11/lib/route2/task.ts, RANK_EXERCISE).
// So this map is decide-then-discover and undo/redo-able, but not graded.
// ---------------------------------------------------------------------------

export type TradeoffAnswer = "yes" | "no";

export type TradeoffQuadrantId = "board" | "internal" | "friction" | "notReal";

export type TradeoffQuadrant = {
  id: TradeoffQuadrantId;
  label: string;
  costHigh: boolean;
  frictionHigh: boolean;
  note: string;
};

export const TRADEOFF_QUADRANTS: TradeoffQuadrant[] = [
  {
    id: "board",
    label: "Genuine board trade-off",
    costHigh: true,
    frictionHigh: true,
    note: "Real capacity is spent, and a different role feels the cost than the one who benefits — this is what actually reaches a board.",
  },
  {
    id: "internal",
    label: "Internal cost only",
    costHigh: true,
    frictionHigh: false,
    note: "Expensive, but absorbed inside one role. Rarely needs to reach a board on its own.",
  },
  {
    id: "friction",
    label: "Political friction, low real cost",
    costHigh: false,
    frictionHigh: true,
    note: "Visible disagreement over something that is cheap to resolve — worth naming, not worth escalating alone.",
  },
  {
    id: "notReal",
    label: "Not a real trade-off",
    costHigh: false,
    frictionHigh: false,
    note: "Section 4's own helper text: if both sides can be maximised at once, it is not a trade-off.",
  },
];

export const tradeoffQuadrantFor = (costHigh: boolean, frictionHigh: boolean): TradeoffQuadrantId =>
  frictionHigh ? (costHigh ? "board" : "friction") : costHigh ? "internal" : "notReal";

export const tradeoffQuadrantById = (id: TradeoffQuadrantId) => TRADEOFF_QUADRANTS.find((q) => q.id === id)!;

export const TRADEOFF_QUESTIONS = {
  q1: {
    key: "q1" as const,
    label: "Cost",
    question:
      "If both sides of this pair were pushed to their maximum at the same time, would something concrete at Vertex break or get worse?",
    yes: "Yes — something concrete gives way",
    no: "No — both sides could be maximised without real cost",
    instruction: "Cost is about a concrete effect, not a general worry.",
  },
  q2: {
    key: "q2" as const,
    label: "Friction",
    question: "Does the cost of this trade-off land on a different role than the one who benefits from it?",
    yes: "Yes — one role pays, another gains",
    no: "No — the same role absorbs both sides",
    instruction: "Friction is about who feels the cost, not how large it is.",
  },
} as const;
