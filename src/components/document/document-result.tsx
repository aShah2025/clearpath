import { CalendarButton } from "@/components/document/calendar-button";
import { LegalHelp } from "@/components/document/legal-help";
import { ReadAloudButton } from "@/components/document/read-aloud-button";
import { Timeline } from "@/components/document/timeline";
import type { TimelineEntry } from "@/components/document/types";

type DocumentResultProps = {
  summary: string;
  items: TimelineEntry[];
  languageTag: string;
  persist: boolean;
};

export function DocumentResult({ summary, items, languageTag, persist }: DocumentResultProps) {
  return (
    <div className="space-y-8" lang={languageTag} dir={languageTag === "ar" ? "rtl" : "ltr"}>
      <section aria-labelledby="summary-heading" className="rounded-lg border-l-4 border-primary bg-accent p-4">
        <h2 id="summary-heading" className="text-lg font-semibold">
          What this means
        </h2>
        <p className="mt-2 text-lg leading-relaxed">{summary}</p>
        <div className="mt-3">
          <ReadAloudButton text={summary} languageTag={languageTag} />
        </div>
      </section>

      <section aria-labelledby="steps-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="steps-heading" className="text-lg font-semibold">
            What to do next
          </h2>
          <CalendarButton items={items} />
        </div>
        <div className="mt-3">
          <Timeline items={items} languageTag={languageTag} persist={persist} />
        </div>
      </section>

      <LegalHelp />
    </div>
  );
}
