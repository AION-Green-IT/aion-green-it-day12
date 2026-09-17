import type { MaterialSection } from "@/lib/materialSection";
import { Icon } from "@/components/icons/LineIcons";
import { Reveal } from "@/components/ui/Reveal";
import { IndustryCallout } from "./IndustryCallout";

/**
 * One material section, in the order the day standard fixes: heading → the
 * diagram → the written explanation → the decision rules → the callout →
 * sources.
 *
 * The diagram comes before the prose deliberately. It is the primary teaching
 * artifact rather than an illustration of a paragraph the learner has already
 * read, and in a facilitator-led block it is what the room looks at while the
 * explanation is being given.
 */
export function MaterialBlock({
  section,
  anchorId,
  children,
  footer,
}: {
  section: MaterialSection;
  /** DOM id the mini-nav and MaterialRefs chips scroll to. */
  anchorId: string;
  /** The section's diagram. */
  children: React.ReactNode;
  /** Rendered after the sources — a micro-check or a read-only worked example. */
  footer?: React.ReactNode;
}) {
  return (
    <Reveal as="section" id={anchorId} className="scroll-mt-24 space-y-5">
      {/* Heading */}
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accentSoft text-accent">
          <Icon name={section.icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-micro font-semibold uppercase tracking-wide text-accent">
              {section.kicker}
            </p>
            <span className="rounded-full border border-line px-2 py-0.5 text-micro text-ash">
              ~{section.minutes} min
            </span>
          </div>
          <h2 className="text-h2 text-ink">{section.title}</h2>
          <p className="mt-1 max-w-prose text-body text-ash">{section.standfirst}</p>
        </div>
      </div>

      {/* The diagram — the primary teaching artifact */}
      <div className="card overflow-hidden p-5">{children}</div>

      {/* The definition — kept visible; it is what the diagram illustrates */}
      <div className="max-w-prose space-y-3 text-body text-ash">
        <p>
          <span className="font-semibold text-ink">Definition. </span>
          {section.definition}
        </p>
      </div>

      {/* Decision rules — what makes the section operational, kept visible */}
      {section.reasoning.length > 0 && (
        <div className="rounded-2xl border-l-4 border-l-accent border-y border-r border-accent/25 bg-accentSoft/50 p-4">
          <p className="text-micro font-semibold uppercase tracking-wide text-accent">
            How to decide when this comes up in the task
          </p>
          <ul className="mt-2 space-y-1.5">
            {section.reasoning.map((rule, i) => (
              <li key={i} className="flex gap-2 text-caption text-ink">
                <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Everything else — insight, takeaway, extended body, callout, sources — collapsed by default */}
      <details className="group">
        <summary className="cursor-pointer text-micro font-semibold uppercase tracking-wide text-accent">
          Read more — insight, detail and sources
        </summary>
        <div className="mt-3 space-y-5">
          <div className="max-w-prose space-y-3 text-body text-ash">
            <p>
              <span className="font-semibold text-ink">Insight. </span>
              {section.insight}
            </p>
            <p>
              <span className="font-semibold text-ink">Practical takeaway. </span>
              {section.takeaway}
            </p>
          </div>

          {section.body.map((block) => (
            <div key={block.heading} className="max-w-prose space-y-2">
              <h3 className="text-h3 text-ink">{block.heading}</h3>
              {block.paragraphs.map((p, i) => (
                <p key={i} className="text-body text-ash">
                  {p}
                </p>
              ))}
            </div>
          ))}

          <IndustryCallout label={section.callout.label} text={section.callout.text} />

          <div className="border-t border-line pt-3">
            <p className="text-micro font-semibold uppercase tracking-wide text-ash">Sources</p>
            <ul className="mt-1.5 space-y-1">
              {section.references.map((r) => (
                <li key={r.label} className="text-micro text-ash">
                  {r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-ink underline decoration-dotted underline-offset-2 hover:text-accent"
                    >
                      {r.label}
                    </a>
                  ) : (
                    <span className="font-semibold text-ink">{r.label}</span>
                  )}
                  {r.detail ? <span> — {r.detail}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      {footer && (
        <details className="group">
          <summary className="cursor-pointer text-micro font-semibold uppercase tracking-wide text-accent">
            Check your understanding (optional)
          </summary>
          <div className="mt-3">{footer}</div>
        </details>
      )}
    </Reveal>
  );
}
