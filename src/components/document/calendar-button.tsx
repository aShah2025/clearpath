"use client";

import { CalendarPlus } from "lucide-react";
import { buildIcs } from "@/lib/calendar/ics";
import type { TimelineEntry } from "@/components/document/types";

type CalendarButtonProps = {
  items: TimelineEntry[];
};

export function CalendarButton({ items }: CalendarButtonProps) {
  const dated = items.filter((item) => item.dueDate);
  if (dated.length === 0) return null;

  function download() {
    const url = URL.createObjectURL(new Blob([buildIcs(dated)], { type: "text/calendar" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "clearpath-deadlines.ics";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-accent"
    >
      <CalendarPlus className="size-4" aria-hidden />
      Add dates to calendar
    </button>
  );
}
