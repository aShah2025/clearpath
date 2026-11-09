"use client";

import { useState } from "react";
import { DocumentResult } from "@/components/document/document-result";
import { SAMPLE_NOTICE, SAMPLE_RESULTS } from "@/lib/demo/sample-notice";
import { cn } from "@/lib/utils";

export function DemoView() {
  const [selected, setSelected] = useState(0);
  const result = SAMPLE_RESULTS[selected];

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <section aria-labelledby="original-heading">
        <h2 id="original-heading" className="text-lg font-semibold">
          The original notice
        </h2>
        <pre className="mt-3 max-h-96 overflow-auto rounded-lg border bg-muted p-4 font-mono text-sm whitespace-pre-wrap" tabIndex={0}>
          {SAMPLE_NOTICE}
        </pre>
      </section>

      <div>
        <div role="group" aria-label="Choose a language" className="mb-4 flex gap-2">
          {SAMPLE_RESULTS.map((option, index) => (
            <button
              key={option.languageTag}
              type="button"
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              lang={option.languageTag}
              className={cn(
                "min-h-11 rounded-md border px-4 text-sm font-medium",
                selected === index ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <DocumentResult key={result.languageTag} summary={result.summary} items={result.items} languageTag={result.languageTag} persist={false} />
      </div>
    </div>
  );
}
