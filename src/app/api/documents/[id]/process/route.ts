import { NextResponse } from "next/server";
import { processDocument } from "@/lib/ai/process-document";
import { handleRouteError } from "@/lib/api/responses";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { requireUser } from "@/lib/auth";

export const maxDuration = 300;

/** POST /api/documents/:id/process reads and explains a document already added. */
export async function POST(_request: Request, ctx: RouteContext<"/api/documents/[id]/process">) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    enforceRateLimit(`process:${user.id}`, 10, 60 * 60 * 1000);
    const document = await processDocument(user.id, id);
    return NextResponse.json({ document });
  } catch (error) {
    return handleRouteError(error, "POST /api/documents/[id]/process");
  }
}
