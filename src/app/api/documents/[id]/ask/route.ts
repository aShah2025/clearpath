import { NextResponse } from "next/server";
import { z } from "zod";
import { answerQuestion } from "@/lib/ai/answer-question";
import { handleRouteError, parseJsonBody } from "@/lib/api/responses";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { requireUser } from "@/lib/auth";

export const maxDuration = 120;

const askSchema = z.object({
  question: z.string().trim().min(3, "Please type your question.").max(500, "Please shorten your question."),
});

/** POST /api/documents/:id/ask answers a question using only this document. */
export async function POST(request: Request, ctx: RouteContext<"/api/documents/[id]/ask">) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const { question } = await parseJsonBody(request, askSchema, 4_000);
    enforceRateLimit(`ask:${user.id}`, 30, 60 * 60 * 1000);
    const answer = await answerQuestion(user.id, id, question);
    return NextResponse.json({ answer });
  } catch (error) {
    return handleRouteError(error, "POST /api/documents/[id]/ask");
  }
}
