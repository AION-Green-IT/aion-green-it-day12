"use client";

import { useProgress } from "@/lib/store";
import type { PlacementMap } from "@/lib/usePlacementHistory";
import { CRITERIA, R2, RESPONSIBILITIES, ROLES, type CriterionId, type FactorId, type TradeoffAnswer } from "@/lib/route2";
import type { RaciCell } from "@/components/ui/RaciGrid";
import { useCriteriaHistory, useRaciHistory, useTradeOffHistory } from "./history";
import { addCriterion, moveCriterion, parseCriteriaOrder, removeCriterion, serialiseCriteriaOrder, type CriteriaOrder } from "./ranking";
import { addLink, parseLinks, removeLink, serialiseLinks, setLinkAnswer, setLinkNote, type TradeOffLink } from "./tradeoffs";

const currentNotes = () => useProgress.getState().notes;
const currentChoices = () => useProgress.getState().choices;

/** Section 3 — top-3-of-7 criteria order, with its own undo history. */
export function useCriteriaActions() {
  const setNote = useProgress((s) => s.setNote);
  const record = useCriteriaHistory((s) => s.recordChange);
  const undoStack = useCriteriaHistory((s) => s.undo);
  const redoStack = useCriteriaHistory((s) => s.redo);
  const canUndo = useCriteriaHistory((s) => s.past.length > 0);
  const canRedo = useCriteriaHistory((s) => s.future.length > 0);

  const snapshot = (): PlacementMap => ({ order: currentNotes()[R2.criteriaRank] || null });
  const restore = (snap: PlacementMap) => setNote(R2.criteriaRank, snap.order ?? "");

  const apply = (next: CriteriaOrder) => {
    record(snapshot());
    setNote(R2.criteriaRank, serialiseCriteriaOrder(next));
  };

  const add = (id: CriterionId) => apply(addCriterion(parseCriteriaOrder(currentNotes()[R2.criteriaRank]), id, CRITERIA.length >= 3 ? 3 : CRITERIA.length));
  const remove = (id: CriterionId) => apply(removeCriterion(parseCriteriaOrder(currentNotes()[R2.criteriaRank]), id));
  const move = (index: number, dir: -1 | 1) => apply(moveCriterion(parseCriteriaOrder(currentNotes()[R2.criteriaRank]), index, dir));

  const undo = () => {
    const snap = undoStack(snapshot());
    if (snap) restore(snap);
  };
  const redo = () => {
    const snap = redoStack(snapshot());
    if (snap) restore(snap);
  };

  return { add, remove, move, undo, redo, canUndo, canRedo };
}

/** Section 4 — the tension-picker links, with its own undo history. */
export function useTradeOffActions() {
  const setNote = useProgress((s) => s.setNote);
  const choose = useProgress((s) => s.choose);
  const record = useTradeOffHistory((s) => s.recordChange);
  const undoStack = useTradeOffHistory((s) => s.undo);
  const redoStack = useTradeOffHistory((s) => s.redo);
  const canUndo = useTradeOffHistory((s) => s.past.length > 0);
  const canRedo = useTradeOffHistory((s) => s.future.length > 0);

  const snapshot = (): PlacementMap => ({ links: currentNotes()[R2.tradeOffs] || null });
  const restore = (snap: PlacementMap) => setNote(R2.tradeOffs, snap.links ?? "");

  const applyLinks = (next: TradeOffLink[]) => {
    record(snapshot());
    setNote(R2.tradeOffs, serialiseLinks(next));
  };

  /** First click arms a pending node; second click on a different node creates the link. */
  const clickFactor = (id: FactorId, max: number) => {
    const pending = currentChoices()[R2.pendingLink] as FactorId | undefined;
    if (!pending) {
      choose(R2.pendingLink, id);
      return;
    }
    if (pending === id) {
      choose(R2.pendingLink, "");
      return;
    }
    applyLinks(addLink(parseLinks(currentNotes()[R2.tradeOffs]), pending, id, max));
    choose(R2.pendingLink, "");
  };

  const remove = (a: FactorId, b: FactorId) => applyLinks(removeLink(parseLinks(currentNotes()[R2.tradeOffs]), a, b));
  const setNoteText = (a: FactorId, b: FactorId, note: string) => setNote(R2.tradeOffs, serialiseLinks(setLinkNote(parseLinks(currentNotes()[R2.tradeOffs]), a, b, note)));

  /** One diagnostic answer for a pair — recorded in the same undo history as the links themselves. */
  const answer = (a: FactorId, b: FactorId, key: "q1" | "q2", value: TradeoffAnswer) => {
    record(snapshot());
    setNote(R2.tradeOffs, serialiseLinks(setLinkAnswer(parseLinks(currentNotes()[R2.tradeOffs]), a, b, key, value)));
  };

  const undo = () => {
    const snap = undoStack(snapshot());
    if (snap) restore(snap);
  };
  const redo = () => {
    const snap = redoStack(snapshot());
    if (snap) restore(snap);
  };

  return { clickFactor, remove, setNoteText, answer, undo, redo, canUndo, canRedo };
}

/** Section 6 — the RACI grid, with its own undo history. */
export function useGovernanceRaciActions() {
  const choose = useProgress((s) => s.choose);
  const record = useRaciHistory((s) => s.recordChange);
  const undoStack = useRaciHistory((s) => s.undo);
  const redoStack = useRaciHistory((s) => s.redo);
  const canUndo = useRaciHistory((s) => s.past.length > 0);
  const canRedo = useRaciHistory((s) => s.future.length > 0);

  const snapshot = (): PlacementMap => {
    const c = currentChoices();
    const snap: PlacementMap = {};
    for (const r of RESPONSIBILITIES) for (const role of ROLES) snap[`${r.id}:${role.id}`] = c[R2.raci(r.id, role.id)] || null;
    return snap;
  };
  const restore = (snap: PlacementMap) => {
    for (const r of RESPONSIBILITIES) for (const role of ROLES) choose(R2.raci(r.id, role.id), snap[`${r.id}:${role.id}`] ?? "");
  };

  const cycle = (responsibilityId: string, roleId: string, next: RaciCell) => {
    record(snapshot());
    choose(R2.raci(responsibilityId, roleId), next);
  };

  const reset = () => {
    record(snapshot());
    for (const r of RESPONSIBILITIES) for (const role of ROLES) choose(R2.raci(r.id, role.id), "");
  };

  const undo = () => {
    const snap = undoStack(snapshot());
    if (snap) restore(snap);
  };
  const redo = () => {
    const snap = redoStack(snapshot());
    if (snap) restore(snap);
  };

  return { cycle, reset, undo, redo, canUndo, canRedo };
}
