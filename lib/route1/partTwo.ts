/**
 * Part 2 — Decide: the Decision Scorecard. Level 2, ~15 minutes.
 *
 * Three competing lines of measures, one of which SmartLink can prioritise.
 * For each of the seven criteria of the lens taught in S6, the learner ranks
 * A, B and C as 1, 2 and 3 — no ties, no sliders — and a live radar draws the
 * three profiles out of those ranks. Then the commit: one option, a
 * justification written the way S7 teaches, two follow-up decisions, and two
 * risks of whichever option the learner's *own* ranking marks as the most
 * attractive in the short term.
 *
 * Nothing here is scored for the learner. The expected ranks exist for the
 * mentor answer keys and the export; the check only compares the learner's
 * ranking with the learner's own justification.
 */

import type { AnswerKeyBlock } from "@/lib/answerKey";
import type { MaterialSectionId } from "./sections";

// ---------------------------------------------------------------------------
// The brief — stated once, above the scorecard
// ---------------------------------------------------------------------------

export const BRIEF = {
  paragraphs: [
    "SmartLink can prioritise one line of measures now. Not two. The budget is limited, management expects visible innovation progress, the data on future energy and operating effects is incomplete, departments want new applications quickly, and IT and operations fear growing complexity and long-term follow-up costs.",
    "Assess all three options against the 7-Criteria Lens, then commit.",
  ],
  constraints: [
    "The budget is limited",
    "Management expects visible innovation progress",
    "Data on future energy and operating effects is incomplete",
    "Departments want new applications quickly",
    "IT and operations fear complexity and follow-up costs",
  ],
} as const;

// ---------------------------------------------------------------------------
// The three options
// ---------------------------------------------------------------------------

export type OptionId = "A" | "B" | "C";
export const OPTION_IDS: OptionId[] = ["A", "B", "C"];
export const isOptionId = (v: string | undefined): v is OptionId => v === "A" || v === "B" || v === "C";

export type ScoreOption = {
  id: OptionId;
  short: string;
  /** Verbatim from the curriculum. */
  name: string;
  /** "What this concretely means" — scope, so the learner assesses substance rather than a label. */
  means: string[];
  material: MaterialSectionId[];
};

export const OPTIONS: ScoreOption[] = [
  {
    id: "A",
    short: "Modernise the network",
    name: "Modernising the network infrastructure with a focus on energy-efficient technologies and load management.",
    means: [
      "Replace or retire the oldest always-on equipment first, and enable load-adaptive operation — sleep states, night-time link and carrier deactivation — wherever traffic visibility allows it.",
      "Consolidate parallel legacy layers with a customer-migration plan, instead of stacking the new generation on top.",
      "Measure energy per site and per layer against a declared boundary, so the effect can be shown.",
      "Capital-heavy and tied to replacement cycles. It changes how the network runs, not how new IoT and 5G use cases get approved.",
    ],
    material: ["levers", "infrastructure"],
  },
  {
    id: "B",
    short: "Governance & architecture framework",
    name: "Introducing a governance and architecture framework for IoT and 5G applications with sustainability and lifecycle criteria.",
    means: [
      "Approval criteria for every new IoT and 5G use case: an evidenced requirement, device density, power supply, data needs, support period and end-of-life route.",
      "Criteria applied at procurement and architecture review — the point at which a device decision becomes a multi-year operating commitment.",
      "A named owner for measuring enabling claims, with a review point for each approved use case.",
      "Low capital, but it slows some approvals and disappoints the wish for visible progress this year; its effect accumulates over every later decision.",
    ],
    material: ["system", "iot", "uncertainty"],
  },
  {
    id: "C",
    short: "Accelerated IoT & 5G expansion",
    name: "Accelerated expansion of IoT and 5G applications to realise innovation and efficiency potentials quickly.",
    means: [
      "Roll out the planned sensor, battery-device and 5G use cases in production and buildings, starting with the most visible applications.",
      "Rely on the per-bit efficiency of new equipment and on expected enabling savings to carry the sustainability case.",
      "Departments get new applications within the year, and management sees innovation progress.",
      "No retirement plan for existing layers and no lifecycle criteria are part of the scope.",
    ],
    material: ["fiveg", "iot"],
  },
];

export const optionById = (id: OptionId): ScoreOption => OPTIONS.find((o) => o.id === id)!;

// ---------------------------------------------------------------------------
// The seven criteria
// ---------------------------------------------------------------------------

export type CriterionId =
  | "leverage"
  | "sustainability"
  | "innovation"
  | "feasibility"
  | "risk"
  | "longterm"
  | "controllability";

export type Rank = 1 | 2 | 3;

export type Criterion = {
  id: CriterionId;
  name: string;
  /** One-word label for the radar axis. */
  axis: string;
  definition: string;
  /** Rendered under the criterion label in the matrix — the lens taught at the point of use. */
  question: string;
  misuse: string;
  /** How the learner's justification would phrase an argument from this criterion. */
  argues: string;
  keywords: RegExp;
  /** Model ranking for the mentor key and the export — never shown to the learner. */
  expected: Record<OptionId, Rank>;
  answerKey: AnswerKeyBlock;
};

export const CRITERIA: Criterion[] = [
  {
    id: "leverage",
    name: "Strategic leverage",
    axis: "Leverage",
    definition: "How many downstream decisions this option improves.",
    question: "What does this make easier that we will have to do anyway?",
    misuse: "Confused with the size of the budget.",
    argues: "leverage",
    keywords: /\b(leverage|downstream|every (later|future|subsequent) decision|later decisions|future decisions)\b/i,
    expected: { B: 1, A: 2, C: 3 },
    answerKey: {
      prompt: "Strategic leverage — model ranking B · A · C",
      items: [
        {
          option: "B ranked 1",
          verdict: "pick",
          why: "Criteria for IoT and 5G approvals improve every later connectivity decision SmartLink will take anyway — the definition of leverage.",
        },
        {
          option: "A ranked 2",
          verdict: "pick",
          why: "Modernisation improves the base every service runs on, but decides nothing about what gets connected next.",
        },
        {
          option: "C ranked 3",
          verdict: "pick",
          why: "Expansion adds applications; it makes no later decision easier. A large budget is not leverage — the misuse the lens names.",
        },
      ],
      teachingNote:
        "A learner who ranks A first usually argues that load management and per-site measurement create the evidence base every later decision needs. That is a defensible leverage argument if the justification says so explicitly.",
    },
  },
  {
    id: "sustainability",
    name: "Sustainability impact",
    axis: "Sustainability",
    definition: "Effect on energy, emissions and lifecycle burden across the boundary you declared.",
    question: "Over what perimeter and compared to what?",
    misuse: "Counted without a boundary.",
    argues: "sustainability impact",
    keywords: /\b(sustainab\w*|emissions?|energy (use|consumption|demand|saving)|footprint|lifecycle burden)\b/i,
    expected: { A: 1, B: 2, C: 3 },
    answerKey: {
      prompt: "Sustainability impact — model ranking A · B · C",
      items: [
        {
          option: "A ranked 1",
          verdict: "pick",
          why: "Directly reduces network energy inside the declared perimeter — always-on draw and legacy layers — and the reduction can be measured against a baseline.",
        },
        {
          option: "B ranked 2",
          verdict: "pick",
          why: "Prevents device, data and layer growth that has not happened yet. Over a multi-year perimeter that includes devices it can rank first; over this year's network perimeter it ranks second.",
        },
        {
          option: "C ranked 3",
          verdict: "pick",
          why: "Adds devices, data and 5G layers. Per-bit efficiency and enabling savings are claims until measured, and rebound works against them.",
        },
      ],
      teachingNote:
        "This is the criterion where the boundary decides the rank (S5: compared to what, over which perimeter?). B first is correct if the learner declares a device-inclusive, multi-year perimeter. Any ranking here without a stated perimeter is the misuse.",
    },
  },
  {
    id: "innovation",
    name: "Innovation benefit",
    axis: "Innovation",
    definition: "New capability that creates real business options.",
    question: "Which department can do something new on Monday?",
    misuse: "Equated with the novelty of the technology.",
    argues: "innovation",
    keywords: /\b(innovat\w*|new capabilit\w*|new applications?|business options?)\b/i,
    expected: { C: 1, A: 2, B: 3 },
    answerKey: {
      prompt: "Innovation benefit — model ranking C · A · B",
      items: [
        {
          option: "C ranked 1",
          verdict: "pick",
          why: "Delivers new applications to departments within the year — someone really can do something new on Monday.",
        },
        {
          option: "A ranked 2",
          verdict: "pick",
          why: "A modern, load-managed network creates capability later use cases build on, but no department gets a new application from it.",
        },
        {
          option: "B ranked 3",
          verdict: "pick",
          why: "A framework filters and sequences innovation; by itself it creates no new capability.",
        },
      ],
      teachingNote:
        "B at 2 defends if the learner argues that clear approval criteria unblock use cases that currently stall. Ranking C first because 5G is new, rather than because a department gains an option, is the misuse to watch for.",
    },
  },
  {
    id: "feasibility",
    name: "Feasibility",
    axis: "Feasibility",
    definition: "Can be executed with current budget, skills and organisational capacity.",
    question: "Who executes this, and what do they stop doing?",
    misuse: "Assessed by the vendor, not by operations.",
    argues: "feasibility",
    keywords: /\b(feasib\w*|budget|capacity to (execute|deliver)|skills|can be (executed|delivered))\b/i,
    expected: { B: 1, C: 2, A: 3 },
    answerKey: {
      prompt: "Feasibility — model ranking B · C · A",
      items: [
        {
          option: "B ranked 1",
          verdict: "pick",
          why: "Low capital and executable with existing architecture and procurement roles. Its demand is organisational: someone has to own the criteria.",
        },
        {
          option: "C ranked 2",
          verdict: "pick",
          why: "Vendors can deliver quickly and departments are pulling for it, but IT and operations absorb the integration and operating complexity.",
        },
        {
          option: "A ranked 3",
          verdict: "pick",
          why: "Capital-heavy, bound to replacement cycles and migration plans, under a limited budget.",
        },
      ],
      teachingNote:
        "A at 2 and C at 3 also defend if the learner assesses feasibility strictly from the operations side — who executes this, and what do they stop doing? What does not defend is ranking C first because the vendor says it is quick.",
    },
  },
  {
    id: "risk",
    name: "Risk",
    axis: "Risk",
    definition: "Exposure if assumptions prove wrong.",
    question: "What breaks if our traffic forecast is wrong by a factor of two?",
    misuse: "Reduced to technical risk only.",
    argues: "low risk",
    keywords: /\b(low(er)? risk|least exposure|exposure|bounded|reversib\w*)\b/i,
    expected: { B: 1, A: 2, C: 3 },
    answerKey: {
      prompt: "Risk (1 = least exposure) — model ranking B · A · C",
      items: [
        {
          option: "B ranked 1",
          verdict: "pick",
          why: "If traffic or device forecasts are wrong by a factor of two, the criteria still apply and can be revised at the next review. Little is sunk.",
        },
        {
          option: "A ranked 2",
          verdict: "pick",
          why: "Capital is committed on a dimensioning assumption, but the gains on retired and load-managed equipment hold whatever traffic does.",
        },
        {
          option: "C ranked 3",
          verdict: "pick",
          why: "Devices, 5G layers and data flows are committed on forecast use cases. If the forecasts are wrong, the fleet and the layers stay.",
        },
      ],
      teachingNote:
        "Risk here is the exposure if assumptions prove wrong. A learner who ranks A first 'because the hardware is proven' has reduced risk to technical risk — the misuse the lens names.",
    },
  },
  {
    id: "longterm",
    name: "Long-term effect",
    axis: "Long-term",
    definition: "Whether the benefit persists after the project ends.",
    question: "Does this still help in year four?",
    misuse: "Confused with project duration.",
    argues: "long-term effect",
    keywords: /\b(long[- ]term|year four|persist\w*|durable|lasting|years? to come)\b/i,
    expected: { B: 1, A: 2, C: 3 },
    answerKey: {
      prompt: "Long-term effect — model ranking B · A · C",
      items: [
        {
          option: "B ranked 1",
          verdict: "pick",
          why: "Criteria keep shaping decisions after the project ends — it still helps in year four.",
        },
        {
          option: "A ranked 2",
          verdict: "pick",
          why: "Retired layers stay retired and efficient hardware keeps saving, but the benefit ages with the equipment and does nothing for new connectivity.",
        },
        {
          option: "C ranked 3",
          verdict: "pick",
          why: "Leaves a larger fleet, more data and more layers to operate for years. The operating load certainly persists; the benefit is unproven.",
        },
      ],
      teachingNote:
        "Confusing long-term effect with project duration is the misuse: C is the longest-running commitment, not the longest-lasting benefit.",
    },
  },
  {
    id: "controllability",
    name: "Controllability",
    axis: "Control",
    definition: "Whether the result can be measured, steered and reversed.",
    question: "How would we know this failed, and could we stop it?",
    misuse: "Assumed because a dashboard exists.",
    argues: "controllability",
    keywords: /\b(controllab\w*|measurable|steer\w*|could (stop|reverse) it)\b/i,
    expected: { A: 1, B: 2, C: 3 },
    answerKey: {
      prompt: "Controllability — model ranking A · B · C",
      items: [
        {
          option: "A ranked 1",
          verdict: "pick",
          why: "Measurable per site and per layer against a declared boundary, steerable through load settings, and partly reversible — sleep windows can be changed.",
        },
        {
          option: "B ranked 2",
          verdict: "pick",
          why: "Measurable through approvals and exceptions, but its sustainability effect is indirect and only visible over time.",
        },
        {
          option: "C ranked 3",
          verdict: "pick",
          why: "Enabling savings are hard to measure and deployments are hard to reverse once devices are installed and layers built.",
        },
      ],
      teachingNote:
        "B at 1 defends if the learner defines controllability over decisions rather than over energy: every approval is a visible, reversible control point. 'We will have a dashboard' is not controllability.",
    },
  },
];

export const criterionById = (id: CriterionId): Criterion => CRITERIA.find((c) => c.id === id)!;

// ---------------------------------------------------------------------------
// Buckets — the prediction unit for the shared grid (CLAUDE.md #14)
//
// Derived directly from each criterion's existing `expected` ranks, not new
// judgement content: rank 1 (strongest) -> High, rank 2 -> Mid, rank 3
// (weakest) -> Low. The ground-truth ranking itself (`Criterion.expected`)
// is untouched.
// ---------------------------------------------------------------------------

export type Bucket = "low" | "mid" | "high";

export const BUCKETS: { id: Bucket; label: string; letter: string }[] = [
  { id: "low", label: "Low", letter: "L" },
  { id: "mid", label: "Mid", letter: "M" },
  { id: "high", label: "High", letter: "H" },
];

export const bucketLabel = (b: Bucket | null): string => (b ? BUCKETS.find((x) => x.id === b)!.label : "—");
export const bucketLetter = (b: Bucket | null): string => (b ? BUCKETS.find((x) => x.id === b)!.letter : "·");

/** Cycles blank → Low → Mid → High → blank, for a single tap per cell. */
const BUCKET_CYCLE: (Bucket | null)[] = [null, "low", "mid", "high"];
export const nextBucket = (current: Bucket | null): Bucket | null =>
  BUCKET_CYCLE[(BUCKET_CYCLE.indexOf(current) + 1) % BUCKET_CYCLE.length];

/** Rank 1 -> High, rank 2 -> Mid, rank 3 -> Low. The one place the rank ground truth becomes a bucket. */
export function bucketForRank(rank: Rank): Bucket {
  if (rank === 1) return "high";
  if (rank === 2) return "mid";
  return "low";
}

const RANK_BUCKET_WORD: Record<Rank, string> = { 1: "High", 2: "Mid", 3: "Low" };

/**
 * The existing per-criterion answer key, relabelled from rank language to
 * bucket language for the mentor-only display next to the grid. Every "why"
 * and the teaching note are the authored content, verbatim — only the
 * option/prompt labels ("B ranked 1" -> "B — High") are rewritten, mechanically,
 * from the same `expected` ranks the rest of the file already carries.
 */
export function criterionAnswerKey(c: Criterion): AnswerKeyBlock {
  return {
    ...c.answerKey,
    prompt: c.answerKey.prompt.replace(/model ranking/i, "model profile"),
    items: c.answerKey.items.map((item) => {
      const m = item.option.match(/^([ABC]) ranked (\d)/);
      if (!m) return item;
      return { ...item, option: `${m[1]} — ${RANK_BUCKET_WORD[Number(m[2]) as Rank]}` };
    }),
  };
}

/** The authored "why" for one option on one criterion — reused as the grid's post-reveal reasoning, not new content. */
export function criterionCellWhy(c: Criterion, optionId: OptionId): string {
  return c.answerKey.items.find((item) => item.option.startsWith(optionId))?.why ?? "";
}

// ---------------------------------------------------------------------------
// The commit
// ---------------------------------------------------------------------------

export const JUSTIFICATION_TEMPLATE =
  "We recommend X. This assumes Y. If [specific indicator] shows Z by [review point], we revise. The cost of being wrong is bounded because [reversibility mechanism].";

export const COMMIT = {
  chosen: {
    label: "Prioritised option",
    instruction:
      "The option with the best rank sum is not automatically your answer. Weighting is a judgement you own.",
  },
  justification: {
    label: "Justification under incomplete information",
    instruction:
      "At least 250 characters. State your assumption, what would falsify it, and the review point. The S7 template is available below if you want it.",
    placeholder: "We recommend … This assumes … If … shows … by …, we revise. The cost of being wrong is bounded because …",
    min: 250,
    sample:
      "We recommend Option B, the governance and architecture framework for IoT and 5G. This assumes that most of SmartLink's future energy and material burden will come from what gets connected next — sensors, battery devices and 5G layers — rather than from the existing network. If the first quarterly energy report shows that the always-on legacy network accounts for most of the measured consumption across the declared perimeter (network sites plus the first sensor fleet, compared with last year's baseline) by the Q2 review, we revise and bring modernisation forward. The cost of being wrong is bounded because the criteria cost little capital and can be amended at any quarterly review.",
  },
  followUp: {
    label: (n: number) => `Follow-up decision ${n}`,
    instruction: "A follow-up decision has an owner and a date. 'Monitor the situation' is not a decision.",
    placeholder: "e.g. The CIO decides by 30 June who signs off device density per building.",
    samples: [
      "The CIO names the owner of the approval criteria by the end of Q1, including who may grant an exception for a production-critical use case.",
      "Facilities and production IT decide by the Q2 review which already-ordered sensor rollouts are paused until they meet the new criteria.",
    ],
  },
  risks: {
    label: (n: number) => `Risk ${n}`,
    promptNotChosen: (option: OptionId) =>
      `You rated Option ${option} highest on short-term attractiveness. Name two risks of choosing it.`,
    promptChosen: "You chose the option you rated most attractive in the short term. Name the two risks you are accepting.",
    promptUnknown:
      "Rank Innovation benefit and Feasibility first — this question is built from your own ranking of those two rows.",
    howComputed:
      "Short-term attractiveness is read from your own predicted profile on Innovation benefit plus Feasibility: the option with the highest combined bucket.",
    instruction:
      "Name a concrete consequence, not a general worry — a layer that stays on, a fleet that needs replacing, a saving that is never measured.",
    samples: [
      "Accelerating C adds 5G layers alongside the existing network without a retirement plan, so total energy rises even though every radio unit is more efficient per bit.",
      "Thousands of sensors and battery devices would be bought before any lifecycle criteria exist, locking SmartLink into a replacement and e-waste programme for years.",
    ],
  },
  answerKey: {
    prompt: "Commit — which option, and on what grounds",
    items: [
      {
        option: "B — governance and architecture framework (curriculum model answer)",
        verdict: "pick",
        why: "Low capital under a limited budget, the lowest exposure if the incomplete data proves wrong, and the only option that answers Signal 6 and the device, battery and 5G signals before they become commitments. It disappoints management's wish for visible innovation — a strong justification names that.",
      },
      {
        option: "A — network modernisation",
        verdict: "pick",
        why: "Defensible, and not marked wrong. Strongest on controllability and on measurable near-term impact inside the network perimeter. A learner choosing A must handle the budget constraint and say what governs the IoT and 5G expansion in the meantime.",
      },
      {
        option: "C — accelerated expansion",
        verdict: "avoid",
        why: "Only defensible as an explicitly bounded pilot with measurement and a retirement plan attached — at which point it borrows B's content. Chosen as written, it is the short-term-attractive, structurally weak option the task is built to expose.",
      },
    ],
    teachingNote:
      "Assess in this order: (1) the justification states an assumption, a falsification condition and a review point; (2) the ranking and the justification agree, or the weighting is explained; (3) sustainability impact is argued with a boundary and a comparison; (4) the two risks are concrete and belong to the auto-identified option. A well-argued A scores higher than a weakly argued B.",
  } as AnswerKeyBlock,
};

/** Heuristic read of a justification — used for the soft inline checker, the clues and the export. */
export type JustificationSignals = {
  assumption: boolean;
  falsifier: boolean;
  reviewPoint: boolean;
  boundary: boolean;
};

export function analyseJustification(text: string): JustificationSignals {
  return {
    assumption: /\b(assum\w*|provided that|on the premise)\b/i.test(text),
    falsifier:
      /\bif\b[^.]{0,200}\b(shows?|falls?|rises?|exceeds?|drops?|stays?|remains?|misses?|fails?|below|above|does not|doesn't)\b|\bunless\b|\bwe (will )?(revise|stop|reverse|reconsider)\b|\bfalsif\w*/i.test(text),
    reviewPoint:
      /\b(review|revisit|re-?assess\w*|checkpoint|milestone)\b|\bby (the )?(end of )?(q[1-4]|january|february|march|april|may|june|july|august|september|october|november|december|month|quarter|year)\b|\b(in|after|within) (\d+|one|two|three|four|six|nine|twelve) (weeks?|months?|quarters?|years?)\b|\bq[1-4]\b/i.test(
        text,
      ),
    boundary: /\b(perimeter|boundary|baseline|compared (to|with)|counterfactual|versus|relative to)\b/i.test(text),
  };
}

export const SOFT_CHECK = {
  review: "No review point detected yet — when will you look at this again?",
  falsifier: "No falsification condition detected yet — what result would make you revise?",
  ok: "An assumption, a falsification condition and a review point all appear to be there.",
  note: "A soft check that reads your wording. It never blocks the export.",
};

export const PART_TWO = {
  id: "part-2",
  tag: "PART 2 · DECIDE — THE DECISION SCORECARD",
  title: "One line of measures, not two",
  minutes: 15,
  meansLabel: "What this concretely means",
  templateLabel: "Show the S7 justification template",
  predictHeading: "Profile all three options, one grid",
  predictInstruction:
    "Tap a cell to cycle Low → Mid → High. Set what you can across all 21 cells before you reveal — the comparison only means something if there is a judgement behind it.",
  revealLabel: "Reveal the model profile",
  revealedLabel: "Model profile revealed",
  gapHeading: "Where your profile and the model profile differ",
  gapEmpty:
    "Every cell you set matches the model profile. Read the reasoning below anyway — the reasoning matters more than getting the bucket right.",
  gapNone: "You haven't profiled anything yet — set some cells above, then reveal.",
  allReasoningLabel: "See the reasoning behind every cell, all three options",
};
