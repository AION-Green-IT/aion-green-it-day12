import {
  CRITERIA,
  ENGAGEMENT,
  EXPORT,
  HORIZONS,
  READINGS,
  ROOT_CAUSES,
  bucketForRank,
  bucketLabel,
  optionById,
  zoneById,
} from "@/lib/route1";
import { CASE } from "@/lib/routes";
import type { Route1State } from "./useRoute1";

/**
 * The route's single export: one JSON for grading and one print-ready HTML
 * report for reading, both covering the whole engagement.
 *
 * Route 1 spans curriculum levels 1 and 2, so the document has a banner per
 * part and the JSON keeps `partOne` and `partTwo` as separate top-level
 * blocks. A grader reading one file can still score the diagnosis and the
 * decision independently; the learner still produced one deliverable.
 *
 * §8.7/§10.5: export is never disabled. `buildEngagementJson`/`buildEngagementHtml`
 * take an `incomplete` flag; when true, both documents carry the
 * `STATUS: INCOMPLETE DRAFT` stamp. A mentor-sample export is stamped too.
 */

const readingLabel = (id: string | null) => READINGS.find((r) => r.id === id)?.label ?? "—";
const rootLabel = (id: string | null) => ROOT_CAUSES.find((r) => r.id === id)?.label ?? "—";
const horizonLabel = (id: string | null) => HORIZONS.find((h) => h.id === id)?.label ?? "—";
const zoneLabel = (id: string | null) => (id ? zoneById(id as never).name : "— not assigned");

/** Describes the learner's own triage pattern factually — never evaluates it (§8.7.4). */
function patternNote(r1: Route1State): string {
  const t = r1.tally;
  if (t.triaged === 0) return "No signals have been triaged yet.";
  const parts: string[] = [
    `${t.triaged} of ${t.total} signals triaged: ${t.governance} attributed to a missing governance or architecture decision, ${t.technology} to technology use.`,
    r1.escalated.length === 0
      ? "No signals escalated yet."
      : `Escalated for a deeper look: ${r1.escalatedSignals.map((s) => `Signal ${s.n} — ${s.title}`).join("; ")}.`,
  ];
  return parts.join(" ");
}

export function buildEngagementJson(r1: Route1State, filename: string, incomplete: boolean): string {
  const payload = {
    meta: {
      day: CASE.day,
      route: 1,
      levels: EXPORT.filenameLevels,
      task: EXPORT.filenameTask,
      schemaVersion: EXPORT.schemaVersion,
      filename,
      status: incomplete ? "incomplete-draft" : "complete",
      mentorSample: r1.mentorSample,
      name: r1.name,
      case: ENGAGEMENT.company,
      role: ENGAGEMENT.role,
      exportedAt: new Date().toISOString(),
    },

    partOne: {
      label: EXPORT.partOne,
      level: 1,
      triage: r1.triage.map((t) => ({
        id: t.signal.id,
        n: t.signal.n,
        title: t.signal.title,
        signalText: t.signal.text,
        rootCause: t.tag,
        rootCauseName: t.tag ? rootLabel(t.tag) : null,
        evidence: t.evidenceText,
        complete: t.complete,
      })),
      triageChecks: r1.triageChecks,
      triageDistribution: {
        triaged: r1.tally.triaged,
        total: r1.tally.total,
        technologyUse: r1.tally.technology,
        missingGovernance: r1.tally.governance,
      },
      escalated: r1.escalatedSignals.map((s) => ({ id: s.id, n: s.n, title: s.title })),
      escalationJustification: r1.escalateWhy,
      deepDive: r1.analyses.map((a) => ({
        id: a.signal.id,
        n: a.signal.n,
        title: a.signal.title,
        reading: a.reading,
        bothJustification: a.bothWhy || null,
        zone: a.zone,
        zoneName: zoneLabel(a.zone),
        withinDefensibleSet: a.zone ? a.signal.acceptableZones.includes(a.zone) : null,
        horizon: a.horizon,
        improvementApproach: a.approach,
        checks: a.checks,
        complete: a.complete,
      })),
      patternNote: patternNote(r1),
    },

    partTwo: {
      label: EXPORT.partTwo,
      level: 2,
      revealed: r1.revealedAll,
      options: r1.optionStates.map((s) => ({
        id: s.option.id,
        name: s.option.name,
        criteria: CRITERIA.map((c) => {
          const predicted = s.predictions[c.id] ?? null;
          const groundTruthRank = c.expected[s.option.id];
          const groundTruthBucket = bucketForRank(groundTruthRank);
          return {
            id: c.id,
            name: c.name,
            predictedBucket: predicted,
            groundTruthRank,
            groundTruthBucket,
            correct: predicted ? predicted === groundTruthBucket : null,
          };
        }),
        hitCount: CRITERIA.filter(
          (c) => s.predictions[c.id] && s.predictions[c.id] === bucketForRank(c.expected[s.option.id]),
        ).length,
      })),
      chosen: r1.chosen,
      chosenOption: r1.chosen ? optionById(r1.chosen).name : null,
      justification: r1.justification,
      followUpDecisions: r1.followUps.filter(Boolean),
      riskTarget: r1.riskTarget,
      risks: r1.risks.filter(Boolean),
    },
  };
  return JSON.stringify(payload, null, 2);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nl2br = (s: string) => esc(s).replace(/\n/g, "<br/>");

/** Standalone, print-ready HTML — no external stylesheet, prints cleanly to A4. */
export function buildEngagementHtml(r1: Route1State, incomplete: boolean): string {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const stampLine = [incomplete ? EXPORT.incompleteStamp : null, r1.mentorSample ? EXPORT.mentorStamp : null]
    .filter(Boolean)
    .join(" · ");

  const triageRows = r1.triage
    .map(
      (t) => `<tr>
      <td><strong>${t.signal.n}. ${esc(t.signal.title)}</strong></td>
      <td class="nowrap">${esc(rootLabel(t.tag))}</td>
      <td>${t.evidenceText ? `&ldquo;${esc(t.evidenceText)}&rdquo;` : '<span class="muted">not tapped</span>'}</td>
    </tr>`,
    )
    .join("");

  const deepDiveRows = r1.analyses
    .map(
      (a) => `<tr>
      <td><strong>${a.signal.n}. ${esc(a.signal.title)}</strong></td>
      <td>${esc(readingLabel(a.reading))}${a.bothWhy ? `<div class="muted">${esc(a.bothWhy)}</div>` : ""}</td>
      <td>${esc(zoneLabel(a.zone))}</td>
      <td class="nowrap">${esc(horizonLabel(a.horizon))}</td>
      <td>${esc(a.approach) || '<span class="muted">not written</span>'}</td>
    </tr>`,
    )
    .join("");

  const optionBlocks = r1.optionStates
    .map(
      (s) => `<h3>Option ${s.option.id} — ${esc(s.option.short)}</h3>
    <table>
      <thead><tr><th>Criterion</th><th class="num">Predicted</th><th class="num">Model</th><th class="num">Match</th></tr></thead>
      <tbody>${CRITERIA.map((c) => {
        const predicted = s.predictions[c.id] ?? null;
        const actualBucket = bucketForRank(c.expected[s.option.id]);
        const match = predicted ? predicted === actualBucket : null;
        return `<tr>
          <td>${esc(c.name)}</td>
          <td class="num">${esc(bucketLabel(predicted))}</td>
          <td class="num">${r1.revealedAll ? esc(bucketLabel(actualBucket)) : "—"}</td>
          <td class="num">${r1.revealedAll && match !== null ? (match ? "✓" : "✕") : "—"}</td>
        </tr>`;
      }).join("")}</tbody>
    </table>`,
    )
    .join("");

  const bullets = (items: string[], empty: string) =>
    items.filter(Boolean).length
      ? `<ul>${items.filter(Boolean).map((t) => `<li>${nl2br(t)}</li>`).join("")}</ul>`
      : `<p class="muted">${esc(empty)}</p>`;

  const chosenOption = r1.chosen ? optionById(r1.chosen) : null;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(EXPORT.docHeading)} — ${esc(r1.name.trim() || "learner")}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px 24px; background: #F5F6F7; color: #16191D;
         font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; font-size: 15px; line-height: 1.6; }
  .sheet { max-width: 900px; margin: 0 auto; background: #fff; border: 1px solid #E2E5E9;
           border-radius: 16px; padding: 40px; }
  .kicker { margin: 0 0 4px; font-size: 11px; letter-spacing: .06em; text-transform: uppercase;
            font-weight: 700; color: #0E7A5A; }
  h1 { margin: 0 0 4px; font-size: 27px; line-height: 1.2; }
  .stamp { margin: 8px 0 0; display: inline-block; padding: 4px 10px; border-radius: 999px;
           background: #B87514; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
  .part { margin: 36px 0 6px; padding: 10px 14px; border-radius: 10px; background: #16191D;
          color: #fff; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; font-weight: 700; }
  h2 { margin: 24px 0 10px; font-size: 13px; letter-spacing: .06em; text-transform: uppercase;
       color: #5E6670; border-top: 1px solid #E2E5E9; padding-top: 16px; }
  h3 { margin: 20px 0 6px; font-size: 15px; }
  .meta { margin: 0; color: #5E6670; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
  th { text-align: left; font-size: 11px; letter-spacing: .05em; text-transform: uppercase;
       color: #5E6670; border-bottom: 1px solid #E2E5E9; padding: 8px 10px 8px 0; font-weight: 700; }
  th.num, td.num { text-align: center; width: 60px; padding-right: 0; }
  td { vertical-align: top; padding: 9px 10px 9px 0; border-bottom: 1px solid #EEF1F3; }
  .muted { color: #5E6670; font-size: 12px; font-style: normal; }
  .nowrap { white-space: nowrap; }
  .pick { margin-top: 10px; padding: 14px 16px; border: 1px solid #E2E5E9;
          border-left: 3px solid #0E7A5A; border-radius: 10px; background: #E7F2EC; }
  .pick strong { display: block; font-size: 16px; margin-bottom: 4px; }
  .summary { margin-top: 10px; padding: 14px 16px; border-radius: 10px; background: #EEF1F3; }
  .summary strong { display: block; font-size: 16px; }
  ul { margin: 8px 0 0; padding-left: 20px; }
  li { margin-bottom: 6px; }
  footer { margin-top: 32px; border-top: 1px solid #E2E5E9; padding-top: 14px;
           color: #5E6670; font-size: 11px; }
  @media (max-width: 560px) {
    body { padding: 12px 8px; }
    .sheet { padding: 18px 14px; border-radius: 12px; }
  }
  @media print {
    body { background: #fff; padding: 0; }
    .sheet { border: 0; border-radius: 0; padding: 0; max-width: none; }
    .part, .stamp { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    h3, table { break-inside: avoid; }
    @page { margin: 16mm; }
  }
</style>
</head>
<body>
<div class="sheet">
  <p class="kicker">AION Green IT · ${esc(CASE.module)} · Route 1 · Levels 1–2</p>
  <h1>${esc(EXPORT.docHeading)}</h1>
  <p class="meta">${esc(r1.name.trim() || "learner")} · ${esc(date)} · Client: ${esc(ENGAGEMENT.company)} · Role: ${esc(ENGAGEMENT.role)}</p>
  ${stampLine ? `<span class="stamp">${esc(stampLine)}</span>` : ""}

  <p class="part">${esc(EXPORT.partOne)}</p>

  <h2>Step 1 — Triage (all six signals)</h2>
  <table>
    <thead><tr><th>Signal</th><th>Root cause</th><th>Evidence phrase</th></tr></thead>
    <tbody>${triageRows}</tbody>
  </table>

  <h2>Step 2 — Escalated for a deeper look</h2>
  <p>${r1.escalatedSignals.length ? esc(r1.escalatedSignals.map((s) => `Signal ${s.n} — ${s.title}`).join("; ")) : '<span class="muted">None escalated yet.</span>'}</p>
  <p>${r1.escalateWhy ? nl2br(r1.escalateWhy) : '<span class="muted">No justification written.</span>'}</p>

  <h2>Step 3 — Deep dive on the escalated signals</h2>
  <table>
    <thead><tr><th>Signal</th><th>Reading</th><th>Area</th><th>Horizon</th><th>Improvement approach</th></tr></thead>
    <tbody>${deepDiveRows || '<tr><td colspan="5" class="muted">No signals escalated yet.</td></tr>'}</tbody>
  </table>

  <h2>Distribution summary</h2>
  <div class="summary">
    <strong>${r1.tally.triaged} of ${r1.tally.total} signals triaged.</strong>
    <span class="muted">${r1.tally.technology} technology use · ${r1.tally.governance} missing governance or architecture decision.</span>
  </div>

  <h2>Pattern note</h2>
  <p>${esc(patternNote(r1))}</p>

  <p class="part">${esc(EXPORT.partTwo)}</p>

  <h2>Profile against the model — 7 criteria × 3 options</h2>
  ${optionBlocks}
  <p class="muted">${r1.revealedAll ? "Model profile revealed." : "Model profile not yet revealed."}</p>

  <h2>Prioritised option</h2>
  <div class="pick">
    <strong>${chosenOption ? `Option ${esc(chosenOption.id)} — ${esc(chosenOption.short)}` : "No option chosen."}</strong>
    ${r1.justification ? nl2br(r1.justification) : '<span class="muted">No justification written.</span>'}
  </div>

  <h2>Follow-up decisions this prioritisation forces</h2>
  ${bullets(r1.followUps, "Not written.")}

  <h2>Risks of the short-term-attractive option${r1.riskTarget ? ` — Option ${esc(r1.riskTarget.option)}` : ""}</h2>
  ${bullets(r1.risks, "Not written.")}

  <footer>
    AION Green IT — ${esc(CASE.module)}, Route 1 (Diagnose &amp; Decide), covering levels 1 and 2.
    ${esc(ENGAGEMENT.company)} is a fictional case for training use. Prepared by the learner named above.
  </footer>
</div>
</body>
</html>`;
}
