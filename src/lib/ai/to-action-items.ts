import type { ActionItemInput } from "@/lib/data/documents";
import type { DocumentAnalysis } from "@/lib/ai/schema";

/**
 * Turns the model's steps and deadlines into timeline rows. Each step becomes
 * one ActionItem; the deadlines pointing at it supply its due date and its
 * consequence. When a step has several deadlines, the earliest exact date wins
 * and every deadline's wording is kept in the description.
 *
 * Exact dates are stored as midnight UTC and must be displayed in UTC, so a
 * notice's "November 14" never shifts a day in the reader's time zone.
 */
export function toActionItems(analysis: DocumentAnalysis): ActionItemInput[] {
  return analysis.actionSteps.map((step, index) => {
    const deadlines = analysis.deadlines.filter((deadline) => deadline.step_index === index);

    const exactDates = deadlines
      .map((deadline) => deadline.date)
      .filter((date): date is string => date !== null)
      .sort();
    const dueDate = exactDates.length > 0 ? new Date(`${exactDates[0]}T00:00:00Z`) : null;

    // Prefer the deadline's consequence: it comes from the document itself.
    const primary =
      deadlines.find((deadline) => deadline.date === exactDates[0]) ?? deadlines[0] ?? null;
    const consequence = primary?.consequence_of_missing ?? step.consequence_of_skipping;

    const deadlineLines = deadlines.map((deadline) => `Deadline: ${deadline.date_text}`);
    const description = [step.details, ...deadlineLines].join("\n\n");

    return {
      title: step.step,
      description,
      dueDate,
      consequence,
      priority: step.priority,
    };
  });
}
