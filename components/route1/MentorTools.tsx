"use client";

import { useState } from "react";
import { useProgress } from "@/lib/store";
import { MentorFillButton } from "@/components/ui/MentorFillButton";
import { AnswerKeyButton } from "@/components/ui/AnswerKeyButton";
import { BUCKETS, COMMIT, CRITERIA, OPTIONS, R1, R1_KEY_PREFIXES, SIGNALS, bucketForRank, type CriterionId } from "@/lib/route1";

/**
 * The route's mentor bar (§13): one demo auto-fill for both parts, the answer
 * keys, and a "Reset to empty" that clears every r1 key in one click behind a
 * confirm. All three sit behind the shared passcode — deliberately visually
 * minor, a convenience gate against accidental clicks, not a security
 * boundary.
 *
 * The fill writes plausible practitioner work, not the key: the triage
 * includes one defensible-but-debatable tag (S4 → Technology use in the demo
 * data, per its sample), Step 2 escalates two signals with a written reason,
 * the Part 2 profile deliberately misses one cell per option so Reveal has
 * something to show, and the chosen option is B. `R1.mentorSample` is set
 * true and stamps every export made while it is active; "Reset to empty"
 * clears it too.
 */
export function MentorTools() {
  const setNote = useProgress((s) => s.setNote);
  const choose = useProgress((s) => s.choose);
  const toggleCheck = useProgress((s) => s.toggleCheck);
  const resetPrefixes = useProgress((s) => s.resetPrefixes);
  const [confirmReset, setConfirmReset] = useState(false);

  const fill = () => {
    setNote(R1.name, "Muchson");
    toggleCheck(R1.mentorSample, true);

    // -- Part 1, Step 1: triage all six signals, plausible but not uniform ---
    for (const s of SIGNALS) {
      const tag = s.sample.rootCause;
      choose(R1.rootCause(s.id), tag);
      // Tap the decisive phrase when the demo tag matches the key, otherwise
      // a plausible non-decisive one — the fill is practitioner work, not the key.
      const holds = tag === s.rootCause;
      const idx = s.segments.findIndex((seg) => typeof seg !== "string" && seg.decisive === holds);
      const fallback = s.segments.findIndex((seg) => typeof seg !== "string");
      choose(R1.evidence(s.id), String(idx >= 0 ? idx : fallback));
    }

    // -- Part 1, Step 2: escalate two, with a leverage-based justification ---
    const escalated = ["s2", "s6"];
    setNote(R1.escalate, escalated.join("|"));
    setNote(
      R1.escalateWhy,
      "Signal 2 and Signal 6 are both structural rather than short-term, and Signal 6 explains why findings like Signal 2 keep recurring across other decisions.",
    );

    // -- Part 1, Step 3: deep dive on the two escalated signals, from sample --
    for (const id of escalated) {
      const s = SIGNALS.find((sig) => sig.id === id)!;
      choose(R1.reading(id), s.sample.reading);
      if (s.sample.bothWhy) setNote(R1.bothWhy(id), s.sample.bothWhy);
      choose(R1.zone(id), s.sample.zone);
      choose(R1.horizon(id), s.sample.horizon);
      setNote(R1.approach(id), s.sample.approach);
    }

    // -- Part 2: profile all three options against the model bucket, with one
    // deliberate miss per option — so Reveal actually shows a warn-coloured
    // cell rather than a suspiciously perfect fill.
    const deliberateMiss: Record<string, CriterionId> = { A: "risk", B: "feasibility", C: "innovation" };
    const bucketIds = BUCKETS.map((b) => b.id);
    for (const o of OPTIONS) {
      for (const c of CRITERIA) {
        const actual = bucketForRank(c.expected[o.id]);
        if (c.id === deliberateMiss[o.id]) {
          const wrong = bucketIds.find((b) => b !== actual)!;
          choose(R1.predict(o.id, c.id), wrong);
        } else {
          choose(R1.predict(o.id, c.id), actual);
        }
      }
    }
    toggleCheck(R1.revealed, true);

    choose(R1.chosen, "B");
    setNote(R1.justification, COMMIT.justification.sample);
    setNote(R1.followUp(1), COMMIT.followUp.samples[0]);
    setNote(R1.followUp(2), COMMIT.followUp.samples[1]);
    setNote(R1.risk(1), COMMIT.risks.samples[0]);
    setNote(R1.risk(2), COMMIT.risks.samples[1]);
  };

  const reset = () => {
    resetPrefixes(R1_KEY_PREFIXES);
    setConfirmReset(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
      <MentorFillButton onFill={fill} />
      <AnswerKeyButton />
      {!confirmReset ? (
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="rounded-full border border-dashed border-line px-3 py-1 text-micro font-semibold text-ash transition-colors duration-150 hover:border-ash hover:text-ink"
        >
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
