import { describe, expect, it } from "vitest";
import { countSentences, documentAnalysisSchema, isCalendarDate, type DocumentAnalysis } from "@/lib/ai/schema";
import { toActionItems } from "@/lib/ai/to-action-items";

const base: DocumentAnalysis = {
  summary: "Your landlord wants you to move out. You have 5 days to answer the court.",
  detected_language: "en",
  actionSteps: [
    { step: "File an answer", details: "Go to the court clerk.", priority: "HIGH", consequence_of_skipping: "You could lose the case." },
    { step: "Call legal aid", details: "Ask for free help.", priority: "MEDIUM", consequence_of_skipping: "You may miss defenses." },
  ],
  deadlines: [],
};

describe("toActionItems", () => {
  it("keeps step order and uses the step's consequence when no deadline applies", () => {
    const items = toActionItems(base);
    expect(items.map((item) => item.title)).toEqual(["File an answer", "Call legal aid"]);
    expect(items[1]).toMatchObject({ dueDate: null, consequence: "You may miss defenses.", description: "Ask for free help." });
  });

  it("uses the earliest exact date and that deadline's consequence", () => {
    const items = toActionItems({
      ...base,
      deadlines: [
        { date: "2026-11-20", date_text: "November 20, 2026", consequence_of_missing: "Late fee.", step_index: 0 },
        { date: "2026-11-14", date_text: "November 14, 2026", consequence_of_missing: "Default judgment.", step_index: 0 },
      ],
    });
    expect(items[0].dueDate?.toISOString()).toBe("2026-11-14T00:00:00.000Z");
    expect(items[0].consequence).toBe("Default judgment.");
    expect(items[0].description).toContain("Deadline: November 14, 2026");
    expect(items[0].description).toContain("Deadline: November 20, 2026");
  });

  it("keeps relative deadline wording without inventing a date", () => {
    const items = toActionItems({
      ...base,
      deadlines: [{ date: null, date_text: "within 5 days of service", consequence_of_missing: "You may be evicted.", step_index: 0 }],
    });
    expect(items[0].dueDate).toBeNull();
    expect(items[0].consequence).toBe("You may be evicted.");
    expect(items[0].description).toBe("Go to the court clerk.\n\nDeadline: within 5 days of service");
  });
});

describe("documentAnalysisSchema", () => {
  it("accepts a valid analysis", () => {
    expect(documentAnalysisSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a summary longer than 3 sentences", () => {
    const result = documentAnalysisSchema.safeParse({ ...base, summary: "One. Two. Three. Four." });
    expect(result.success).toBe(false);
  });

  it("rejects a deadline pointing at a missing step", () => {
    const result = documentAnalysisSchema.safeParse({
      ...base,
      deadlines: [{ date: null, date_text: "soon", consequence_of_missing: "x", step_index: 5 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects impossible calendar dates", () => {
    expect(isCalendarDate("2026-02-30")).toBe(false);
    expect(isCalendarDate("2026-11-14")).toBe(true);
    expect(isCalendarDate("Nov 14")).toBe(false);
  });

  it("counts sentences across languages", () => {
    expect(countSentences("Tiene 5 días. Llame a ayuda legal.")).toBe(2);
    expect(countSentences("")).toBe(0);
  });
});
