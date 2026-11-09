import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { ANALYSIS_MODEL, getAnthropicClient } from "@/lib/ai/client";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserMessage } from "@/lib/ai/prompt";
import { analysisOutputSchema, documentAnalysisSchema, type DocumentAnalysis } from "@/lib/ai/schema";
import { toActionItems } from "@/lib/ai/to-action-items";
import {
  claimDocumentForProcessing,
  saveDocumentAnalysis,
  updateDocumentStatus,
  type DocumentDetail,
} from "@/lib/data/documents";
import { AnalysisError, AppError } from "@/lib/errors";

export type AnalysisClient = {
  beta: { messages: { parse: Anthropic["beta"]["messages"]["parse"] } };
};

const outputFormat = betaZodOutputFormat(analysisOutputSchema);

/**
 * Asks Claude for the analysis and returns it only if it passes the strict
 * schema. Never logs document text: it is the user's private data.
 */
export async function requestAnalysis(
  rawText: string,
  targetLanguage: string,
  client: AnalysisClient = getAnthropicClient(),
): Promise<DocumentAnalysis> {
  let response;
  try {
    response = await client.beta.messages.parse({
      model: ANALYSIS_MODEL,
      max_tokens: 16000,
      // A safety-classifier refusal is retried server-side on the model
      // Anthropic recommends for that refusal category.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "high", format: outputFormat },
      system: [
        { type: "text", text: ANALYSIS_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: buildAnalysisUserMessage(rawText, targetLanguage) }],
    });
  } catch (error) {
    throw toAnalysisError(error);
  }

  if (response.stop_reason === "refusal") {
    console.warn("[analysis] Model declined", { category: response.stop_details?.category });
    throw new AnalysisError("We can't explain this document. Please contact a local legal aid office for help.");
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    console.error("[analysis] Unusable model output", { stopReason: response.stop_reason });
    throw new AnalysisError();
  }

  const result = documentAnalysisSchema.safeParse(response.parsed_output);
  if (!result.success) {
    console.error("[analysis] Output failed validation", {
      issues: result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
    throw new AnalysisError();
  }
  return result.data;
}

/**
 * Full pipeline for one document: claim it, analyze the text, and save the
 * summary and timeline. The document ends COMPLETED or FAILED, never stuck in
 * PROCESSING because of an error here.
 */
export async function analyzeDocument(
  userId: string,
  documentId: string,
  source: string | (() => Promise<string>),
  client?: AnalysisClient,
): Promise<DocumentDetail> {
  // Throws NotFound or Conflict before any status change or model call. A lazy
  // source (reading a file) runs only after the claim succeeds.
  const { targetLanguage } = await claimDocumentForProcessing(
    userId,
    documentId,
    typeof source === "string" ? source : undefined,
  );

  try {
    const rawText = typeof source === "string" ? source : await source();
    const analysis = await requestAnalysis(rawText, targetLanguage, client);
    return await saveDocumentAnalysis(userId, documentId, {
      rawText,
      plainSummary: analysis.summary,
      detectedLanguage: analysis.detected_language,
      actionItems: toActionItems(analysis),
    });
  } catch (error) {
    try {
      await updateDocumentStatus(userId, documentId, "FAILED");
    } catch (statusError) {
      console.error("[analysis] Could not mark document FAILED", { documentId, statusError });
    }
    throw error;
  }
}

function toAnalysisError(error: unknown): AppError {
  if (error instanceof Anthropic.RateLimitError || error instanceof Anthropic.InternalServerError) {
    console.warn("[analysis] Claude unavailable", { status: error.status });
    return new AnalysisError("Our reading service is busy. Please try again in a minute.");
  }
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    console.error("[analysis] Anthropic credentials rejected; check ANTHROPIC_API_KEY", { status: error.status });
    return new AnalysisError();
  }
  if (error instanceof Anthropic.APIError) {
    console.error("[analysis] Claude API error", { status: error.status, requestId: error.requestID });
    return new AnalysisError();
  }
  console.error("[analysis] Unexpected error calling Claude", error);
  return new AnalysisError();
}
