"use client";

import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { materialRefs, type MaterialSectionId } from "@/lib/route2";

/** The shared header every one of the four exercises opens with, including its material chips (CLAUDE.md #11b). */
export function ExerciseHeader({
  n,
  title,
  minutes,
  intro,
  material,
}: {
  n: number;
  title: string;
  minutes: number;
  intro: string;
  material: MaterialSectionId[];
}) {
  return (
    <div>
      <p className="text-micro font-semibold uppercase tracking-wide text-accent">
        Exercise {n} · about {minutes} minutes
      </p>
      <h3 className="mt-1 text-h3 text-ink">{title}</h3>
      <p className="mt-1 max-w-prose text-caption text-ash">{intro}</p>
      <MaterialRefs refs={materialRefs(material)} />
    </div>
  );
}
