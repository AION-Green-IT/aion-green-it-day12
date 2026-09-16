import type { SeriesStyle } from "@/components/ui/RadarChart";
import type { OptionId } from "@/lib/route1";

/**
 * One visual identity per option, shared by the option cards and the commit
 * panel: a colour, a dash pattern and a marker shape, so the three are
 * distinguishable without relying on colour alone.
 */
export const OPTION_STYLE: Record<OptionId, SeriesStyle> = {
  A: { color: "accent", marker: "circle" },
  B: { color: "ink", dash: "7 4", marker: "square" },
  C: { color: "warn", dash: "2 4", marker: "triangle" },
};
