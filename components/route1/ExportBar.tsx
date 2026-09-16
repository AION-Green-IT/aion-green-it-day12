"use client";

import { useState } from "react";
import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { markRouteExported } from "@/lib/routeGating";
import { exportFilename, downloadTextFile } from "@/lib/downloadFile";
import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { SavedIndicator } from "@/components/ui/SavedIndicator";
import { MissingList } from "@/components/ui/MissingList";
import { ChevronDown } from "@/components/icons/LineIcons";
import { EXPORT } from "@/lib/route1";
import { useRoute1, domId } from "./useRoute1";
import { buildEngagementHtml, buildEngagementJson } from "./exportDocuments";

/**
 * The route's one sticky export bar, covering both parts (CLAUDE.md #12).
 *
 * Never disabled (CLAUDE.md #3): the first click while incomplete opens the
 * itemised missing list and jumps to the first gap. A second, explicit
 * "Export anyway (incomplete)" button sits under the list and always works —
 * the export it produces is stamped STATUS: INCOMPLETE DRAFT in both files
 * (§8.7/§10.5). A mentor-sample state stamps every export it produces too.
 */
export function ExportBar() {
  const r1 = useRoute1();
  const toggleCheck = useProgress((s) => s.toggleCheck);
  const [showMissing, setShowMissing] = useState(false);

  const doExport = (incomplete: boolean) => {
    const filename = exportFilename(r1.name, EXPORT.filenameLevels, EXPORT.filenameTask);
    downloadTextFile(`${filename}.json`, buildEngagementJson(r1, filename, incomplete), "application/json");
    downloadTextFile(`${filename}.html`, buildEngagementHtml(r1, incomplete), "text/html");
    markRouteExported(toggleCheck, 1);
    setShowMissing(false);
  };

  const handleExport = () => {
    if (!r1.allComplete) {
      setShowMissing(true);
      const first = r1.missing[0];
      if (first) {
        first.before?.();
        window.setTimeout(() => scrollToAndFlash(first.id), first.before ? 40 : 0);
      }
      return;
    }
    doExport(false);
  };

  return (
    <div
      id={domId.export}
      className="sticky bottom-0 z-20 -mx-4 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 print:hidden"
    >
      {showMissing && r1.missing.length > 0 && (
        <div className="mb-2 max-h-52 space-y-3 overflow-y-auto rounded-xl border border-line bg-canvas p-3">
          <MissingList items={r1.missing} lead="Still needed before export:" />
          <button
            type="button"
            onClick={() => doExport(true)}
            className="rounded-lg border border-warn/50 bg-warn/5 px-3 py-1.5 text-caption font-semibold text-warn transition-colors duration-150 hover:bg-warn/10"
          >
            {EXPORT.anywayLabel}
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <button type="button" onClick={() => setShowMissing((v) => !v)} className="flex flex-wrap items-center gap-x-1.5 text-caption text-ash hover:text-ink">
            <span>
              <span className="tabular-nums font-semibold text-ink">{r1.triageCompleteCount}</span> / {r1.tally.total} signals triaged
            </span>
            <span className="text-ash">·</span>
            <span>
              <span className="tabular-nums font-semibold text-ink">{r1.totalPredicted}</span> / {r1.totalCells} cells profiled
            </span>
            {r1.missing.length > 0 && (
              <>
                <span className="text-ash">
                  · {r1.missing.length} item{r1.missing.length === 1 ? "" : "s"} still needed
                </span>
                <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform duration-150", showMissing && "rotate-180")} />
              </>
            )}
          </button>
          <span className="mx-1 hidden text-ash sm:inline">·</span>
          <SavedIndicator />
          {r1.mentorSample && (
            <span className="rounded-full border border-warn/40 bg-warn/10 px-2 py-0.5 text-micro font-semibold text-warn">
              {EXPORT.mentorStamp}
            </span>
          )}
        </div>
        <button type="button" onClick={handleExport} className="btn-accent">
          {EXPORT.buttonLabel}
        </button>
      </div>
    </div>
  );
}
