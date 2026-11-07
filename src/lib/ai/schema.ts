import { z } from "zod";

/**
 * Contract for the document analysis the model must return. The system prompt
 * and structured-output format are derived from this schema, and every model
 * response is validated against it before anything is persisted.
 */

export const prioritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const actionStepSchema = z.object({
  step: z.string().trim().min(1).max(500),
  priority: prioritySchema,
});

export const deadlineSchema = z.object({
  /** ISO date (YYYY-MM-DD) when the notice gives one, otherwise the notice's wording. */
  date: z.string().trim().min(1).max(255),
  consequence_of_missing: z.string().trim().min(1).max(1000),
});

const MAX_SUMMARY_SENTENCES = 3;

export const documentAnalysisSchema = z.object({
  summary: z
    .string()
    .trim()
    .min(1)
    .max(800)
    .refine(
      (text) => (text.match(/[.!?](\s|$)/g)?.length ?? 1) <= MAX_SUMMARY_SENTENCES,
      { message: `Summary must be at most ${MAX_SUMMARY_SENTENCES} sentences` },
    ),
  actionSteps: z.array(actionStepSchema).max(20),
  deadlines: z.array(deadlineSchema).max(20),
});

export type Priority = z.infer<typeof prioritySchema>;
export type ActionStep = z.infer<typeof actionStepSchema>;
export type DeadlineInfo = z.infer<typeof deadlineSchema>;
export type DocumentAnalysis = z.infer<typeof documentAnalysisSchema>;
