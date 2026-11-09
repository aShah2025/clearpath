import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeDocument } from "@/lib/ai/analyze-document";
import { handleRouteError, parseJsonBody } from "@/lib/api/responses";
import { requireUser } from "@/lib/auth";

// Analysis can take a while on long documents; see the client timeouts in
// src/lib/ai/client.ts.
export const maxDuration = 300;

const MAX_BODY_BYTES = 1_000_000;

const analyzeRequestSchema = z.object({
  rawText: z
    .string()
    .trim()
    .min(20, "The document text is too short to analyze.")
    .max(200_000, "The document text is too long."),
});

/**
 * POST /api/documents/:id/analyze
 * Body: { rawText: string } — the document's text (from OCR or pasted).
 * Returns the document with its plain-language summary and timeline.
 */
export async function POST(request: Request, ctx: RouteContext<"/api/documents/[id]/analyze">) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const { rawText } = await parseJsonBody(request, analyzeRequestSchema, MAX_BODY_BYTES);

    const document = await analyzeDocument(user.id, id, rawText);
    return NextResponse.json({ document });
  } catch (error) {
    return handleRouteError(error, "POST /api/documents/[id]/analyze");
  }
}
