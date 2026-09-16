"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { LivePanel } from "@/components/ui/LivePanel";
import { EXPORT, TASK_INTRO } from "@/lib/route2";
import { VertexConditionsRail } from "./CaseBrief";
import { Prioritize } from "./Prioritize";
import { TradeOffMap } from "./TradeOffMap";
import { Governance } from "./Governance";
import { DecideNow } from "./DecideNow";
import { MemoPreview } from "./MemoPreview";
import { useRoute2, domId } from "./useRoute2";

/**
 * The task — four flat exercises on the left (with the Vertex conditions
 * rail above them, always visible), the live Board Memo preview on the right
 * via LivePanel (a sticky column on desktop, a tap-to-expand strip on
 * mobile — always reachable, never gated behind completion, CLAUDE.md #6).
 *
 * Phase 3 replaced the former nine section components with four, matching
 * day11's flat Task.tsx composition shape (CLAUDE.md #14): Prioritize,
 * TradeOffMap, Governance, DecideNow. No exercise gates another.
 */
export function Task() {
  const r2 = useRoute2();
  const draftedCount = Object.values(r2.drafted).filter(Boolean).length;

  return (
    <section id={domId.task} className="scroll-mt-24 space-y-6">
      <SectionHeading kicker={`${TASK_INTRO.tag} · about ${TASK_INTRO.minutes} minutes`} title={TASK_INTRO.title} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <VertexConditionsRail />
          <Prioritize r2={r2} />
          <TradeOffMap r2={r2} />
          <Governance r2={r2} />
          <DecideNow r2={r2} />
        </div>

        <LivePanel title={EXPORT.docHeading} summary={`${draftedCount} of 8 memo sections drafted`}>
          <MemoPreview r2={r2} />
        </LivePanel>
      </div>
    </section>
  );
}
