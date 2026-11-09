import { z } from "zod";

/*
 * Contract for the document analysis Claude returns.
 *
 * Two layers:
 * - `analysisOutputSchema` is sent to the API as the structured-output format,
 *   so the model can only produce JSON of this shape. It stays to plain
 *   types, enums and descriptions, which the format supports.
 * - `documentAnalysisSchema` re-validates the parsed result with the rules a
 *   JSON schema cannot express (sentence count, real calendar dates, step
 *   references). Nothing is saved unless it passes.
 */

export const prioritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);

const actionStepOutputSchema = z.object({
  step: z
    .string()
    .describe("Short instruction starting with a verb, under 80 characters. Example: \"File a written answer with the court\"."),
  details: z
    .string()
    .describe("One to three plain sentences on how to do this step: where to go, what to bring, who to call."),
  priority: prioritySchema.describe(
    "HIGH if missing it could cost the person their home, benefits, money, or legal rights soon. MEDIUM if important but not urgent. LOW if helpful but optional.",
  ),
  consequence_of_skipping: z
    .string()
    .describe("One plain sentence on what can happen if the person does not do this step."),
});

const deadlineOutputSchema = z.object({
  date: z
    .string()
    .nullable()
    .describe("The deadline as YYYY-MM-DD, only when the document states an exact calendar date. Null when the deadline is relative (for example \"within 5 days\") or unclear."),
  date_text: z
    .string()
    .describe("The deadline in the document's own words, for example \"within 5 days of service\" or \"November 14, 2026\"."),
  consequence_of_missing: z
    .string()
    .describe("One plain sentence on what happens if the deadline is missed, as stated or clearly implied by the document."),
  step_index: z
    .int()
    .describe("Zero-based index into actionSteps of the step this deadline applies to."),
});

export const analysisOutputSchema = z.object({
  summary: z
    .string()
    .describe("At most 3 short sentences at a 6th-grade reading level: what this document is, what it wants, and how urgent it is."),
  detected_language: z
    .string()
    .describe("BCP 47 code of the language the document is written in, for example \"en\" or \"es\"."),
  actionSteps: z
    .array(actionStepOutputSchema)
    .describe("What the person should do, most urgent first. Empty if the document asks nothing of them."),
  deadlines: z
    .array(deadlineOutputSchema)
    .describe("Every deadline in the document. Each one points to the action step it belongs to."),
});

export type AnalysisOutput = z.infer<typeof analysisOutputSchema>;

const MAX_SUMMARY_SENTENCES = 3;
const MAX_ITEMS = 20;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const sentenceSegmenter = new Intl.Segmenter(undefined, { granularity: "sentence" });

export function countSentences(text: string): number {
  let count = 0;
  for (const { segment } of sentenceSegmenter.segment(text)) {
    if (segment.trim()) count++;
  }
  return count;
}

/** True for a real calendar date in YYYY-MM-DD form (rejects 2026-02-30). */
export function isCalendarDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const text = (max: number) => z.string().trim().min(1).max(max);

export const documentAnalysisSchema = z
  .object({
    summary: text(800).refine((value) => countSentences(value) <= MAX_SUMMARY_SENTENCES, {
      message: `Summary must be at most ${MAX_SUMMARY_SENTENCES} sentences`,
    }),
    detected_language: z.string().trim().regex(/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/),
    actionSteps: z
      .array(
        z.object({
          step: text(200),
          details: text(1000),
          priority: prioritySchema,
          consequence_of_skipping: text(500),
        }),
      )
      .max(MAX_ITEMS),
    deadlines: z
      .array(
        z.object({
          date: z.string().refine(isCalendarDate, { message: "Expected a YYYY-MM-DD date" }).nullable(),
          date_text: text(255),
          consequence_of_missing: text(1000),
          step_index: z.int().nonnegative(),
        }),
      )
      .max(MAX_ITEMS),
  })
  .superRefine((analysis, ctx) => {
    analysis.deadlines.forEach((deadline, index) => {
      if (deadline.step_index >= analysis.actionSteps.length) {
        ctx.addIssue({
          code: "custom",
          path: ["deadlines", index, "step_index"],
          message: "Deadline points to an action step that does not exist",
        });
      }
    });
  });

export type Priority = z.infer<typeof prioritySchema>;
export type DocumentAnalysis = z.infer<typeof documentAnalysisSchema>;
