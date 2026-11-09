import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api/responses";
import { requireUser } from "@/lib/auth";
import { PASTED_TEXT_FILE_URL } from "@/lib/data/constants";
import { deleteDocument, getDocumentSource } from "@/lib/data/documents";
import { deleteDocumentFile } from "@/lib/storage/documents";

/** DELETE /api/documents/:id removes the stored file and all extracted data. */
export async function DELETE(_request: Request, ctx: RouteContext<"/api/documents/[id]">) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const { fileUrl } = await getDocumentSource(user.id, id);
    if (fileUrl !== PASTED_TEXT_FILE_URL) await deleteDocumentFile(fileUrl);
    await deleteDocument(user.id, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error, "DELETE /api/documents/[id]");
  }
}
