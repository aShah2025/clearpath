"use client";

import { useState } from "react";
import type { TimelineEntry } from "@/components/document/types";
import { cn } from "@/lib/utils";

type TimelineProps = {
  items: TimelineEntry[];
  languageTag: string;
  /** When false (the demo), check-offs stay in the browser. */
  persist: boolean;
};

const PRIORITY_STYLES: Record<TimelineEntry["priority"], { label: string; className: string }> = {
  HIGH: { label: "Urgent", className: "bg-destructive text-destructive-foreground" },
  MEDIUM: { label: "Important", className: "bg-warning text-warning-foreground" },
  LOW: { label: "Helpful", className: "bg-secondary text-secondary-foreground" },
};

function formatDueDate(iso: string, languageTag: string): string {
  return new Intl.DateTimeFormat(languageTag, { dateStyle: "long", timeZone: "UTC" }).format(new Date(iso));
}

export function Timeline({ items, languageTag, persist }: TimelineProps) {
  const [entries, setEntries] = useState(items);
  const [error, setError] = useState<string | null>(null);

  function setCompleted(id: string, isCompleted: boolean) {
    setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, isCompleted } : entry)));
  }

  async function toggle(id: string, isCompleted: boolean) {
    setError(null);
    setCompleted(id, isCompleted);
    if (!persist) return;
    try {
      const response = await fetch(`/api/action-items/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
    } catch {
      setCompleted(id, !isCompleted);
      setError("We couldn't save that. Please try again.");
    }
  }

  const done = entries.filter((entry) => entry.isCompleted).length;

  return (
    <div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {done} of {entries.length} steps done
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <ol className="mt-4 space-y-3">
        {entries.map((entry) => {
          const priority = PRIORITY_STYLES[entry.priority];
          return (
            <li key={entry.id} className={cn("rounded-lg border bg-card p-4", entry.isCompleted && "opacity-70")}>
              <div className="flex items-start gap-3">
                <input
                  id={`step-${entry.id}`}
                  type="checkbox"
                  checked={entry.isCompleted}
                  onChange={(event) => toggle(entry.id, event.target.checked)}
                  className="mt-1 size-6 shrink-0 accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded px-2 py-0.5 text-xs font-semibold", priority.className)}>
                      {priority.label}
                    </span>
                    {entry.dueDate && (
                      <span className="text-sm font-semibold">{formatDueDate(entry.dueDate, languageTag)}</span>
                    )}
                  </div>
                  <label htmlFor={`step-${entry.id}`} className={cn("mt-1 block font-semibold", entry.isCompleted && "line-through")}>
                    {entry.title}
                  </label>
                  <p className="mt-1 whitespace-pre-line text-sm">{entry.description}</p>
                  <p className="mt-2 text-sm">
                    <span className="font-semibold">If you miss this: </span>
                    {entry.consequence}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
