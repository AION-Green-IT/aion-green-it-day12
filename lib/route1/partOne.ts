/**
 * Part 1 — Diagnose: the Signal Board. Level 1, ~15 minutes.
 *
 * Six signals from SmartLink's plan. Placement is the *result* of a diagnosis
 * (CURRICULUM-GUIDE §5): the learner answers two diagnostic questions —
 * potential or risk, and the primary area affected — and the card routes
 * itself to the chosen zone. Then, in place, three required inputs: an
 * improvement approach, the root cause and the time horizon.
 *
 * "Check my routing" reads patterns across the whole board and gives clues; it
 * never names a zone (CLAUDE.md #4). The expected answers below exist for those
 * clues, for the mentor answer keys and for the export — never for the learner.
 */

import type { AnswerKeyBlock } from "@/lib/answerKey";
import type { IconKey } from "@/lib/routes";
import type { MaterialSectionId } from "./sections";

// ---------------------------------------------------------------------------
// Zones
// ---------------------------------------------------------------------------

export type ZoneId = "network" | "iot" | "data" | "energy" | "lifecycle" | "fiveg" | "management";
export type ZoneFamily = "technology" | "crosscutting";

export type Zone = {
  id: ZoneId;
  name: string;
  /** The name broken over two lines for the hexagon label. */
  lines: [string, string];
  family: ZoneFamily;
  icon: IconKey;
  /** One line on what belongs here — never what the answer is. */
  note: string;
};

export const ZONES: Zone[] = [
  {
    id: "network",
    name: "Network Operations",
    lines: ["Network", "Operations"],
    family: "technology",
    icon: "network",
    note: "How the network is run day to day: what is switched on, when, and against what load.",
  },
  {
    id: "iot",
    name: "IoT Devices",
    lines: ["IoT", "Devices"],
    family: "technology",
    icon: "sensor",
    note: "The devices themselves: how many, which kind, and what each one needs to keep working.",
  },
  {
    id: "data",
    name: "Data Volume",
    lines: ["Data", "Volume"],
    family: "technology",
    icon: "database",
    note: "What is transmitted, stored and processed — and whether anyone uses it.",
  },
  {
    id: "energy",
    name: "Energy Demand",
    lines: ["Energy", "Demand"],
    family: "technology",
    icon: "gauge",
    note: "Electricity drawn by devices, network and sites, and whether it follows useful load.",
  },
  {
    id: "lifecycle",
    name: "Life Cycle",
    lines: ["Life", "Cycle"],
    family: "crosscutting",
    icon: "recycleLoop",
    note: "What a decision commits you to from manufacture to disposal: maintenance, replacement, e-waste.",
  },
  {
    id: "fiveg",
    name: "5G Use",
    lines: ["5G", "Use"],
    family: "technology",
    icon: "antenna",
    note: "Where 5G capacity is deployed, and whether the requirement behind it is real.",
  },
  {
    id: "management",
    name: "Management Logic",
    lines: ["Management", "Logic"],
    family: "crosscutting",
    icon: "layers",
    note: "How connectivity decisions are assessed, approved, measured and reviewed.",
  },
];

export const zoneById = (id: ZoneId): Zone => ZONES.find((z) => z.id === id)!;
export const isZoneId = (v: string | undefined): v is ZoneId => ZONES.some((z) => z.id === v);

export const ZONE_FAMILIES: Record<ZoneFamily, { label: string; note: string }> = {
  technology: {
    label: "Technology domains",
    note: "A component, a device, a data stream or an energy draw.",
  },
  crosscutting: {
    label: "Cross-cutting domains",
    note: "A commitment over time or a decision process — not any single component.",
  },
};

// ---------------------------------------------------------------------------
// The diagnostic questions and the in-place inputs
// ---------------------------------------------------------------------------

export type Reading = "potential" | "risk" | "both";
export type RootCause = "technology" | "governance";
export type Horizon = "short" | "structural";

export const READINGS: { id: Reading; label: string; hint: string }[] = [
  {
    id: "potential",
    label: "Sustainability potential",
    hint: "Handled as planned, this saves energy, emissions or material somewhere.",
  },
  {
    id: "risk",
    label: "Sustainability risk",
    hint: "Handled as planned, this adds energy, emissions or material burden somewhere.",
  },
  {
    id: "both",
    label: "Both — depends on how it is governed",
    hint: "The same signal can go either way. Say in one line what decides it.",
  },
];

export const ROOT_CAUSES: { id: RootCause; label: string; hint: string }[] = [
  {
    id: "technology",
    label: "Technology use",
    hint: "Better equipment, or a different way of running it, removes the problem.",
  },
  {
    id: "governance",
    label: "Missing governance or architecture decision",
    hint: "Whatever equipment is bought, the problem returns until someone decides.",
  },
];

export const HORIZONS: { id: Horizon; label: string; hint: string }[] = [
  {
    id: "short",
    label: "Visible short-term",
    hint: "The effect appears within the current operating year.",
  },
  {
    id: "structural",
    label: "Structurally effective",
    hint: "It changes how future decisions are made.",
  },
];

export const READING_FIELD = {
  label: "Q1 · Potential or risk?",
  instruction: "Read the signal as SmartLink currently plans it, not as it could ideally be done.",
};

export const BOTH_FIELD = {
  label: "One-line justification",
  instruction:
    "Required when you choose Both. Name the condition that decides which way it goes — for example whether the savings are measured, or whether an older layer is retired.",
  placeholder: "e.g. Potential only where savings are measured against a baseline; otherwise it adds devices and data.",
};

export const ZONE_FIELD = {
  label: "Q2 · Primary area affected?",
  instruction: "Choose where the effect first becomes real — not where it is eventually reported.",
};

export const APPROACH_FIELD = {
  label: "Improvement approach",
  instruction:
    "State an action, not a goal. 'Enable load-based deactivation on the aggregation layer at night' — not 'improve efficiency'.",
  placeholder:
    "e.g. Network operations enables night-time sleep modes on the aggregation layer, after agreeing latency exceptions.",
  min: 40,
};

export const ROOT_CAUSE_FIELD = {
  label: "Root cause",
  instruction: "Ask: would buying better equipment fix this, or would it only postpone it?",
};

export const HORIZON_FIELD = {
  label: "Time horizon",
  instruction:
    "Short-term = the effect appears within the current operating year. Structural = it changes how future decisions are made.",
};

// ---------------------------------------------------------------------------
// The six signals
// ---------------------------------------------------------------------------

export type SignalSample = {
  reading: Reading;
  bothWhy?: string;
  zone: ZoneId;
  approach: string;
  rootCause: RootCause;
  horizon: Horizon;
};

/**
 * A signal's text, broken into tappable spans for the triage step. A plain
 * string renders as-is; `{ text, decisive }` renders as a tappable phrase —
 * `decisive: true` is the one phrase that actually proves the root-cause tag,
 * the rest are texture or a plausible-but-wrong anchor. Joined end to end the
 * segments reproduce `text` exactly; nothing here changes what the signal says.
 */
export type Segment = string | { text: string; decisive: boolean };

export type Signal = {
  id: string;
  n: number;
  /** Short handle used on the board and in the report. */
  title: string;
  /** The signal exactly as the curriculum states it. */
  text: string;
  /** The same text, broken into tappable evidence phrases for the triage step. */
  segments: Segment[];
  /** Expected primary zone, and every zone the answer key accepts as defensible. */
  zone: ZoneId;
  acceptableZones: ZoneId[];
  reading: Reading;
  acceptableReadings: Reading[];
  rootCause: RootCause;
  horizon: Horizon;
  /**
   * Directional clue for the deep-dive check when the chosen zone is outside
   * the defensible set. Points at the reasoning, never at a zone name.
   */
  clue: string;
  /** Triage-step reasoning — why the root-cause tag holds, shown after two checks or once the whole set holds. */
  triageWhy: string;
  /** Deep-dive reasoning — why the area and horizon hold, shown together after two checks or once they hold. */
  analysisWhy: string;
  material: MaterialSectionId[];
  /** Mentor demo fill: plausible practitioner work, deliberately not the key. */
  sample: SignalSample;
  answerKey: AnswerKeyBlock;
};

export const SIGNALS: Signal[] = [
  {
    id: "s1",
    n: 1,
    title: "Always-on legacy infrastructure",
    text: "The existing network infrastructure is partly outdated and permanently active, regardless of actual load.",
    segments: [
      { text: "The existing network infrastructure is partly outdated", decisive: false },
      " and ",
      { text: "permanently active, regardless of actual load", decisive: true },
      ".",
    ],
    zone: "network",
    acceptableZones: ["network", "energy"],
    reading: "risk",
    acceptableReadings: ["risk", "both"],
    rootCause: "technology",
    horizon: "short",
    clue: "Signal 1 describes equipment that stays switched on whatever the load. Ask which part of the system decides what is switched on and when — not where the electricity bill finally lands.",
    triageWhy:
      "Modern, load-adaptive equipment and enabled sleep states remove always-on draw — that is a technology-use fix. Nothing about it requires a new approval process, which is what would make it governance instead.",
    analysisWhy:
      "Network Operations — the defect is an operating mode: capacity powered for uptime rather than for load. Load-adaptive operation and sleep states are Network Operations levers. Visible short-term — enabling deactivation windows on existing equipment shows in the current operating year's consumption.",
    material: ["infrastructure", "levers"],
    sample: {
      reading: "risk",
      zone: "network",
      approach:
        "Network operations enables load-based link and carrier deactivation between 22:00 and 06:00 on the aggregation layer, after agreeing latency exceptions for the two production-critical services.",
      rootCause: "technology",
      horizon: "short",
    },
    answerKey: {
      prompt: "Signal 1 — Always-on legacy infrastructure",
      items: [
        {
          option: "Network Operations (expected)",
          verdict: "pick",
          why: "The defect is an operating mode: capacity powered for uptime rather than for load. It first becomes real in how the network is run — what is switched on, when, and against which traffic. Load-adaptive operation and sleep states are Network Operations levers (S2).",
        },
        {
          option: "Energy Demand (defensible, weaker)",
          verdict: "pick",
          why: "Where the effect is eventually reported: the electricity bill. The Q2 helper exists for exactly this case — almost every signal ends up in Energy Demand, so routing by where it is reported erases the difference between six different findings. Accept it, and ask what the operating decision behind it is.",
        },
        {
          option: "Reading: Sustainability risk (expected)",
          verdict: "pick",
          why: "As planned, the network keeps drawing baseline power without useful load (S1). Both defends only if the justification names the governing condition — modernisation with load management.",
        },
        {
          option: "Root cause: Technology use (expected)",
          verdict: "pick",
          why: "Modern, load-adaptive equipment and enabled sleep states do remove always-on draw. Nothing about this requires a new approval process.",
        },
        {
          option: "Horizon: Visible short-term (expected)",
          verdict: "pick",
          why: "Enabling deactivation windows on existing equipment shows in the current operating year's consumption.",
        },
      ],
      teachingNote:
        "A learner who reads 'partly outdated' as a legacy layer awaiting a sunset decision — and tags Missing governance + Structurally effective — has a real argument: retiring a generation is a governance and customer-migration decision (the 3G example in S1). Accept it if the improvement approach names the migration and its owner. What does not hold is Missing governance + Visible short-term: a sunset decision does not pay back inside one operating year.",
    },
  },
  {
    id: "s2",
    n: 2,
    title: "Large-scale sensor rollout",
    text: "New IoT sensors are to be introduced in large numbers across production and buildings.",
    segments: [
      { text: "New IoT sensors are to be introduced", decisive: false },
      " in ",
      { text: "large numbers across production and buildings", decisive: true },
      ".",
    ],
    zone: "iot",
    acceptableZones: ["iot", "lifecycle"],
    reading: "both",
    acceptableReadings: ["both", "risk"],
    rootCause: "governance",
    horizon: "structural",
    clue: "Signal 2 is about how many things are being connected. Ask where that number first becomes a physical fact — before any energy, data or disposal follows from it.",
    triageWhy:
      "Better sensors lower the impact per device, not the count. The fix is criteria at procurement — a governance decision about how many devices are justified, not an equipment choice.",
    analysisWhy:
      "IoT Devices — the signal is the device count itself, and fleet impact is device count × lifetime × replacement rate × data generated. Structurally effective — selection criteria change how every later device decision is made.",
    material: ["iot"],
    sample: {
      reading: "both",
      bothWhy:
        "Potential only where condition monitoring or occupancy-driven HVAC savings are measured against a baseline; everywhere else it adds devices, data and maintenance.",
      zone: "iot",
      approach:
        "Facilities and production IT agree density and use-case criteria before the purchase order: every sensor type needs a named saving, a baseline and a stated support period.",
      rootCause: "governance",
      horizon: "structural",
    },
    answerKey: {
      prompt: "Signal 2 — Large-scale sensor rollout",
      items: [
        {
          option: "IoT Devices (expected)",
          verdict: "pick",
          why: "The signal is the device count itself. Fleet impact is device count × lifetime × replacement rate × data generated (S3), and the first factor is decided here.",
        },
        {
          option: "Life Cycle (defensible)",
          verdict: "pick",
          why: "A learner who reads 'in large numbers' as a replacement programme in waiting routes to Life Cycle, and that holds. The weak version of the argument is 'IoT is always a lifecycle issue', which would put every device signal in one zone.",
        },
        {
          option: "Data Volume",
          verdict: "avoid",
          why: "Sensors do produce data, but this signal says nothing about what is transmitted or used — that is Signal 4's finding.",
        },
        {
          option: "Reading: Both — depends on how it is governed (expected)",
          verdict: "pick",
          why: "IoT's sustainability case is almost always an enabling case: savings elsewhere, real only if measured (S3). The justification line should name that condition.",
        },
        {
          option: "Reading: Sustainability potential",
          verdict: "avoid",
          why: "Reads the sales pitch, not the plan. Nothing in the signal says the savings will be measured or that density has been assessed.",
        },
        {
          option: "Root cause: Missing governance or architecture decision (expected)",
          verdict: "pick",
          why: "Better sensors lower per-device impact, not the count, the lifetime commitment or the data. The fix is criteria at procurement, where a device decision becomes a multi-year operating commitment.",
        },
        {
          option: "Horizon: Structurally effective (expected)",
          verdict: "pick",
          why: "Selection criteria change how every later device decision is made.",
        },
      ],
      teachingNote:
        "Participants often tag Technology use on the grounds that 'the sensors are the technology'. Run the equipment test with them: would a better sensor make a fleet of thousands a smaller commitment? It makes each device smaller; it does not decide how many there should be.",
    },
  },
  {
    id: "s3",
    n: 3,
    title: "Battery-powered devices",
    text: "Battery-powered devices are planned for several areas of application.",
    segments: [
      { text: "Battery-powered devices", decisive: false },
      " are ",
      { text: "planned for several areas of application", decisive: true },
      ".",
    ],
    zone: "lifecycle",
    acceptableZones: ["lifecycle", "iot"],
    reading: "risk",
    acceptableReadings: ["risk", "both"],
    rootCause: "governance",
    horizon: "structural",
    clue: "Reconsider whether Signal 3 is really about power draw — or about how long devices stay in service, and what happens every time a battery runs out.",
    triageWhy:
      "A longer-life battery only postpones the replacement programme; it does not remove it. The fix is a power-supply architecture decision per application area — governance, not equipment.",
    analysisWhy:
      "Life Cycle — batteries convert an energy problem into a maintenance and waste problem at fleet scale; the effect first becomes real as a replacement programme and an e-waste stream. Structurally effective — the criterion changes every future device purchase; its effect is not visible in this year's consumption.",
    material: ["iot"],
    sample: {
      reading: "risk",
      zone: "lifecycle",
      approach:
        "Procurement requires mains or PoE power wherever cabling exists, and for battery devices a replaceable battery, a stated service interval and a WEEE take-back route.",
      rootCause: "governance",
      horizon: "structural",
    },
    answerKey: {
      prompt: "Signal 3 — Battery-powered devices",
      items: [
        {
          option: "Life Cycle (expected)",
          verdict: "pick",
          why: "Batteries convert an energy problem into a maintenance and waste problem at fleet scale (S3). The effect first becomes real as a replacement programme and an e-waste stream, not as grid electricity.",
        },
        {
          option: "IoT Devices (defensible)",
          verdict: "pick",
          why: "Holds if the learner argues that the power supply is a device attribute. The approach then has to address the replacement and disposal consequence, or the finding loses its point.",
        },
        {
          option: "Energy Demand (strongest wrong answer)",
          verdict: "avoid",
          why: "'Battery' sounds like energy. But battery devices barely touch SmartLink's electricity bill — their cost lands in field service and disposal.",
        },
        {
          option: "Reading: Sustainability risk (expected)",
          verdict: "pick",
          why: "As planned, several application areas acquire recurring battery replacement and waste. Both defends if the justification names where battery power genuinely avoids cabling work.",
        },
        {
          option: "Root cause: Missing governance or architecture decision (expected)",
          verdict: "pick",
          why: "A longer-life battery postpones the replacement programme; it does not remove it. The fix is a power-supply architecture decision per application area.",
        },
        {
          option: "Horizon: Structurally effective (expected)",
          verdict: "pick",
          why: "The criterion changes every future device purchase; its effect is not visible in this year's consumption.",
        },
      ],
      teachingNote:
        "Participants who tag Technology use usually propose energy harvesting or better batteries. Both are legitimate — and both are equipment answers to what the equipment test says is a decision: which application areas justify a battery at all.",
    },
  },
  {
    id: "s4",
    n: 4,
    title: "Data collected, not analysed",
    text: "Data is collected from many sources, but not all of it is actually analysed.",
    segments: [
      "Data is ",
      { text: "collected from many sources", decisive: false },
      ", but ",
      { text: "not all of it is actually analysed", decisive: true },
      ".",
    ],
    zone: "data",
    acceptableZones: ["data", "management"],
    reading: "risk",
    acceptableReadings: ["risk", "both"],
    rootCause: "technology",
    horizon: "short",
    clue: "Signal 4 is about data that is produced and moved but never used. Ask where that unused data first costs something — before anyone decides anything about it.",
    triageWhy:
      "Polling intervals, telemetry frequency, payload size and duplicate streams are settings. Changing how the technology is used removes the waste without buying anything or creating a new approval process.",
    analysisWhy:
      "Data Volume — unanalysed data is still transmitted, stored and processed; the effect first becomes real as volume, energy spent on data nobody uses. Visible short-term — moving unused streams to event-driven transmission reduces volume inside the operating year.",
    material: ["iot", "levers"],
    sample: {
      reading: "risk",
      zone: "management",
      approach:
        "Operations and the data owners list every sensor stream against the decision it feeds; streams with no consumer move to event-driven transmission or are switched off.",
      rootCause: "governance",
      horizon: "short",
    },
    answerKey: {
      prompt: "Signal 4 — Data collected, not analysed",
      items: [
        {
          option: "Data Volume (expected)",
          verdict: "pick",
          why: "Unanalysed data is still transmitted, stored and processed. The effect first becomes real as volume — energy spent on data nobody uses — and the lever is protocol and data discipline (S2).",
        },
        {
          option: "Management Logic (defensible)",
          verdict: "pick",
          why: "Holds when 'not analysed' is read as the absence of a decision about which data serves which decision. Accept it if the approach names who decides; note that it then overlaps with Signal 6.",
        },
        {
          option: "Energy Demand",
          verdict: "avoid",
          why: "Where the transmission and storage energy is eventually reported. Route by where the effect first becomes real.",
        },
        {
          option: "Reading: Sustainability risk (expected)",
          verdict: "pick",
          why: "As planned, data keeps growing without use. Both defends only if the justification names the analysis that would turn it into an enabling saving.",
        },
        {
          option: "Root cause: Technology use (expected)",
          verdict: "pick",
          why: "Polling intervals, telemetry frequency, payload size and duplicate streams are settings. Changing how the technology is used removes the waste without buying anything — the cheapest lever in S2, and the least owned.",
        },
        {
          option: "Horizon: Visible short-term (expected)",
          verdict: "pick",
          why: "Moving unused streams to event-driven transmission reduces volume inside the operating year.",
        },
      ],
      teachingNote:
        "The mentor demo fill routes this signal to Management Logic and tags it Missing governance + Visible short-term — a plausible practitioner answer that triggers the check's contradiction clue. Use it to show the difference: a governance gap rarely resolves inside one operating year, while a data-discipline setting does.",
    },
  },
  {
    id: "s5",
    n: 5,
    title: "5G expanded for speed and flexibility",
    text: "5G applications are to be expanded mainly because of speed and flexibility.",
    segments: [
      { text: "5G applications are to be expanded", decisive: false },
      " ",
      { text: "mainly because of speed and flexibility", decisive: true },
      ".",
    ],
    zone: "fiveg",
    acceptableZones: ["fiveg", "management"],
    reading: "risk",
    acceptableReadings: ["risk", "both"],
    rootCause: "governance",
    horizon: "structural",
    clue: "Signal 5 names a reason for expanding a technology. Ask where that reason is supposed to be tested before anything is deployed.",
    triageWhy:
      "A more efficient radio unit does not answer whether the use case needed 5G at all. The missing piece is a qualification rule that tests the reason before anything is deployed — a governance decision.",
    analysisWhy:
      "5G Use — the signal is about why 5G capacity gets deployed; 'speed and flexibility' is not a requirement until a use-case qualifier has tested it. Structurally effective — a qualification rule changes every later deployment decision.",
    material: ["fiveg"],
    sample: {
      reading: "both",
      bothWhy:
        "Potential where a use case needs latency or density that existing connectivity cannot deliver and an older layer is retired; otherwise traffic and layers simply grow.",
      zone: "fiveg",
      approach:
        "The architecture board qualifies each 5G use case against throughput, latency, density and mobility, and approves none without a named layer to retire.",
      rootCause: "governance",
      horizon: "structural",
    },
    answerKey: {
      prompt: "Signal 5 — 5G expanded for speed and flexibility",
      items: [
        {
          option: "5G Use (expected)",
          verdict: "pick",
          why: "The signal is about why 5G capacity gets deployed. 'Speed and flexibility' is not a requirement until the Use-Case Qualifier (S4) has asked whether existing connectivity cannot deliver it.",
        },
        {
          option: "Management Logic (defensible)",
          verdict: "pick",
          why: "Holds if the learner routes the missing qualification step rather than the deployment. The approach should then name the approval gate.",
        },
        {
          option: "Energy Demand",
          verdict: "avoid",
          why: "The rebound consequence ends up in Energy Demand — which is exactly why it is the wrong place to file it: by the time it shows there, the layers are built.",
        },
        {
          option: "Reading: Sustainability risk (expected)",
          verdict: "pick",
          why: "As planned — speed and flexibility as the reason — per-bit efficiency invites rebound, and new layers run alongside old ones (S4).",
        },
        {
          option: "Reading: Both (defensible)",
          verdict: "pick",
          why: "Holds with a justification naming the conditions: an evidenced requirement and a retired layer.",
        },
        {
          option: "Root cause: Missing governance or architecture decision (expected)",
          verdict: "pick",
          why: "More efficient radio units do not answer whether the use case needed 5G. The per-bit gain is real; the missing piece is the decision rule.",
        },
        {
          option: "Horizon: Structurally effective (expected)",
          verdict: "pick",
          why: "A qualification rule changes every later deployment decision.",
        },
      ],
      teachingNote:
        "The honest counter-case: some industrial use cases do need deterministic latency or high device density, and for those 5G is justified. The finding is not that 5G is wrong — it is that 'speed and flexibility' has not yet been turned into an evidenced requirement.",
    },
  },
  {
    id: "s6",
    n: 6,
    title: "No integrated lifecycle assessment",
    text: "There is no integrated sustainability or lifecycle assessment for network and IoT decisions.",
    segments: [
      "There is ",
      { text: "no integrated sustainability or lifecycle assessment", decisive: true },
      " ",
      { text: "for network and IoT decisions", decisive: false },
      ".",
    ],
    zone: "management",
    acceptableZones: ["management", "lifecycle"],
    reading: "risk",
    acceptableReadings: ["risk"],
    rootCause: "governance",
    horizon: "structural",
    clue: "Re-read what Signal 6 actually describes: not a component or a device, but the absence of a process.",
    triageWhy:
      "No equipment purchase creates an assessment process. Only a governance decision — naming an owner and a review cadence — closes this gap.",
    analysisWhy:
      "Management Logic — the signal describes the absence of an assessment inside the decision process; nothing in it is a component, everything in it is how decisions are made. Structurally effective — an assessment changes how every future network and IoT decision is made; its first effect is on decisions, not on this year's consumption.",
    material: ["system", "iot", "infrastructure"],
    sample: {
      reading: "risk",
      zone: "management",
      approach:
        "The CIO's architecture board adds energy, device-density and lifecycle criteria to every network and IoT approval, with one owner presenting the results at each quarterly review.",
      rootCause: "governance",
      horizon: "structural",
    },
    answerKey: {
      prompt: "Signal 6 — No integrated lifecycle assessment",
      items: [
        {
          option: "Management Logic (expected)",
          verdict: "pick",
          why: "The signal describes the absence of an assessment inside the decision process. Nothing in it is a component; everything in it is how decisions are made.",
        },
        {
          option: "Life Cycle (defensible)",
          verdict: "pick",
          why: "Holds if 'lifecycle assessment' is read as the missing content rather than the missing process. Weaker, because the signal names sustainability assessment in general and applies to network decisions, not only devices.",
        },
        {
          option: "Any technology domain",
          verdict: "avoid",
          why: "A process gap does not live in a device, a link or a data stream. This is the signal most often pulled into a technology zone by association with the rest of the plan.",
        },
        {
          option: "Reading: Sustainability risk (expected)",
          verdict: "pick",
          why: "An absent assessment cannot save anything by itself. Reading it as potential confuses the fix with the finding.",
        },
        {
          option: "Root cause: Missing governance or architecture decision (expected)",
          verdict: "pick",
          why: "No equipment purchase creates an assessment process.",
        },
        {
          option: "Horizon: Structurally effective (expected)",
          verdict: "pick",
          why: "An assessment changes how every future network and IoT decision is made; its first effect is on decisions, not on this year's consumption.",
        },
      ],
      teachingNote:
        "This is the signal the check's technology-overload clue points at. It is also the finding Option B in Part 2 answers most directly — a good question for learners who choose A or C is what they would do about it.",
    },
  },
];

export const signalById = (id: string): Signal => SIGNALS.find((s) => s.id === id)!;

/** `Battery-powered devices are planned for several…` — the handle the missing list quotes. */
export function signalExcerpt(signal: Signal, words = 6): string {
  const all = signal.text.replace(/[.]$/, "").split(/\s+/);
  return all.length <= words ? all.join(" ") : `${all.slice(0, words).join(" ")}…`;
}

// ---------------------------------------------------------------------------
// Framing
// ---------------------------------------------------------------------------

export const PART_ONE = {
  id: "part-1",
  tag: "PART 1 · DIAGNOSE",
  title: "Six signals from SmartLink's plan",
  minutes: 15,
  framing:
    "You will not have time to give all six signals a full workup, and that is deliberate: triage all six shallowly, then escalate the two that most deserve a closer look.",
} as const;

export const TRIAGE = {
  step: "Step 1",
  title: "Triage all six signals",
  minutes: 6,
  intro:
    "For each signal, tag the root cause and tap the phrase in the signal itself that proves your tag. Check the set when you're done — the check reports how many rows hold, never which ones, since the tag is a two-way choice.",
  material: ["infrastructure", "levers", "iot", "fiveg"] as MaterialSectionId[],
  rule: {
    label: "Rule from the material — your anchor",
    text: "Run the equipment test: would better or more efficient equipment remove this problem, or only postpone it? If equipment fixes it: technology use. If nothing about the equipment changes what is still missing: a missing governance or architecture decision.",
  },
  becauseLabel: "Because",
  evidencePrompt: "Tap the phrase in the signal that proves your tag.",
  checkLabel: "Check my triage",
  recheckLabel: "Check again",
  clueLabel: "Need a clue?",
  clueText:
    "The decisive phrase in every signal is now marked. Read it again against the rule above, then retag the ones that don't fit yet.",
  revealAfter: 2,
  revealLabel: "Show the reasoning",
  whyHolds: "Why this holds",
  whyNot: "Why this doesn't hold yet",
  result: (ok: number, total: number) =>
    ok === total
      ? `All ${total} hold up — tag and evidence.`
      : `${ok} of ${total} hold up. A row holds when the tag is right and the phrase you tapped is the one that decides it.`,
  incomplete: (items: string[]) => `Before checking: ${items.join("; ")}.`,
  stale: "You've changed an answer since the last check — check again to see where you stand now.",
  revealNote: (at: number) => `Reasoning shown after ${at} check${at === 1 ? "" : "s"} — recorded in the export.`,
} as const;

export const ESCALATE = {
  step: "Step 2",
  title: "Escalate two for a deeper look",
  minutes: 2,
  limit: 2,
  intro:
    "You will not analyse all six in depth — pick the two signals that most deserve it, and say why. This is the actual level-1 skill: judging where attention pays off, not processing everything to the same depth.",
  material: ["levers"] as MaterialSectionId[],
  fullNote: "Two are already selected. Remove one first, then choose a different signal.",
  whyField: {
    label: "Why these two?",
    instruction:
      "One or two sentences. Argue from leverage — what's expensive, structural, or explains other findings — not from what's easiest to write about.",
    placeholder: "e.g. These two are structural rather than short-term, and each explains a pattern the other four don't…",
  },
} as const;

export const DEEP_DIVE = {
  kicker: "Deep dive",
  step: "Step 3",
  title: "Analyse your two",
  minutes: 7,
  intro: "Full workup: area affected, sustainability reading, time horizon, and the improvement approach you'd take.",
  triageReminder: "Your triage",
  notTriaged: "You have not tagged this signal's root cause yet — do that in Step 1 first.",
  checkLabel: "Check area & horizon",
  recheckLabel: "Check again",
  checkScope: "Checks the area and time horizon together — never your wording.",
  clueLabel: "Need a clue?",
  revealAfter: 2,
  revealLabel: "Show the reasoning",
  incomplete: "Pick an area and a time horizon before checking.",
  holds: "That holds up — area and horizon both fit. Carry on with the reading and the improvement approach.",
  wrong: "That doesn't hold up yet. Look again, or ask for a clue.",
  stale: "You've changed an answer since the last check — check again to see where you stand now.",
  whyLabel: "Why",
  revealNote: "Reasoning shown after two checks — recorded in the export.",
} as const;

// ---------------------------------------------------------------------------
// Mentor-only answer keys for the two set-level checks (CLAUDE.md #7)
// ---------------------------------------------------------------------------

export const TRIAGE_ANSWER_KEY: AnswerKeyBlock = {
  prompt: "Triage — expected tag and decisive phrase per signal",
  items: SIGNALS.map((s) => {
    const decisive = s.segments.find(
      (seg): seg is { text: string; decisive: boolean } => typeof seg !== "string" && seg.decisive,
    );
    const label = ROOT_CAUSES.find((r) => r.id === s.rootCause)!.label;
    return {
      option: `Signal ${s.n} — ${s.title}`,
      verdict: "pick" as const,
      why: `${label}, because "${decisive?.text}". ${s.triageWhy}`,
    };
  }),
  teachingNote:
    "Every row's non-decisive phrase is a plausible wrong anchor, not a distractor for its own sake — Signal 1's 'partly outdated' reads like a hardware-replacement story, Signal 6's 'for network and IoT decisions' reads like a technology-domain finding. A learner who ends up on the wrong tag has usually anchored on that phrase.",
};

export const ESCALATION_ANSWER_KEY: AnswerKeyBlock = {
  prompt: "Which two signals are worth escalating",
  items: [
    {
      option: "Signal 2 — Large-scale sensor rollout",
      verdict: "pick",
      why: "Structural and device-count driven: the fix is procurement criteria that changes every future purchase. A strong pick if the rationale is 'fix the decision that multiplies'.",
    },
    {
      option: "Signal 5 — 5G expanded for speed and flexibility",
      verdict: "pick",
      why: "The clearest case of an unqualified reason driving deployment, with a traceable fix — a qualification gate. A strong pick if the rationale is 'stop the rebound before it's built'.",
    },
    {
      option: "Signal 6 — No integrated lifecycle assessment",
      verdict: "pick",
      why: "The multiplier signal — it explains why findings like the others keep recurring across decisions. A strong pick if the rationale is 'fix the cause of the causes'.",
    },
    {
      option: "Signal 3 — Battery-powered devices",
      verdict: "pick",
      why: "A structural finding with an easily missed reading — most people expect an energy story and find a lifecycle-and-waste one instead. A strong pick if the rationale is 'this is the signal most people misdiagnose'.",
    },
    {
      option: "Signal 1 — Always-on legacy infrastructure",
      verdict: "avoid",
      why: "Real, but thin material for a deep dive: the fix is 'enable load-based deactivation' and the horizon is obviously short-term. Escalating it spends a slot on the easiest signal in the set.",
    },
    {
      option: "Signal 4 — Data collected, not analysed",
      verdict: "avoid",
      why: "Real and cheap to fix — a settings change, not a decision — which makes it the shallowest structural question in the set. Escalating it alongside another quick win spends both slots on easy wins rather than two different structural questions.",
    },
  ],
  teachingNote:
    "There is no single correct pair. The assessment criterion is whether the written justification argues from leverage — what's expensive, structural or explains other findings — rather than from what happens to be quickest to write up. A pair of 1 and 4 with a leverage-based justification is a worse answer than a pair of 2 and 6 with none.",
};
