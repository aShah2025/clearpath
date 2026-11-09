import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, parseJsonBody } from "@/lib/api/responses";
import { requireUser } from "@/lib/auth";
import { setActionItemCompleted } from "@/lib/data/action-items";

const patchSchema = z.object({ isCompleted: z.boolean() });

/** PATCH /api/action-items/:id checks a step on or off. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/action-items/[id]">) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const { isCompleted } = await parseJsonBody(request, patchSchema, 1_000);
    const actionItem = await setActionItemCompleted(user.id, id, isCompleted);
    return NextResponse.json({ actionItem });
  } catch (error) {
    return handleRouteError(error, "PATCH /api/action-items/[id]");
  }
}
