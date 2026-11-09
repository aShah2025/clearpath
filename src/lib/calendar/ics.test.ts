import { describe, expect, it } from "vitest";
import { buildIcs } from "@/lib/calendar/ics";

const dated = {
  id: "a",
  title: "File an answer, today; please",
  description: "Go to court.",
  consequence: "You could lose.",
  dueDate: "2026-11-30T00:00:00.000Z",
};

describe("buildIcs", () => {
  it("creates an all-day event that ends the next day, across a month boundary", () => {
    const ics = buildIcs([dated]);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261130");
    expect(ics).toContain("DTEND;VALUE=DATE:20261201");
  });

  it("escapes text and uses CRLF line endings", () => {
    const ics = buildIcs([dated]);
    expect(ics).toContain("SUMMARY:File an answer\\, today\; please");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
  });

  it("skips undated items and folds long lines", () => {
    const ics = buildIcs([
      { ...dated, id: "b", dueDate: null },
      { ...dated, id: "c", description: "x".repeat(300) },
    ]);
    expect(ics).not.toContain("UID:b@clearpath");
    expect(ics.split("\r\n").every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
  });
});
