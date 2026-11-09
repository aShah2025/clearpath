import { NextResponse } from "next/server";
import { z } from "zod";
import { TARGET_LANGUAGE_TAGS } from "@/lib/ai/languages";
import { handleRouteError } from "@/lib/api/responses";
import { requireUser } from "@/lib/auth";
import { PASTED_TEXT_FILE_URL } from "@/lib/data/constants";
import { countDocumentsSince, createDocument } from "@/lib/data/documents";
import { AppError, RateLimitedError } from "@/lib/errors";
import { storeDocumentFile } from "@/lib/storage/documents";
import { detectFileType } from "@/lib/storage/file-types";

const DAILY_DOCUMENT_LIMIT = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

const fieldsSchema = z.object({
  targetLanguage: z.enum(TARGET_LANGUAGE_TAGS),
  text: z.string().trim().min(20, "Please paste more of the document.").max(200_000).optional(),
});

function badFile(message: string): AppError {
  return new AppError(message, 400, "INVALID_FILE");
}

/** POST /api/documents: multipart form with `targetLanguage` and either `file` or `text`. */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const recent = await countDocumentsSince(user.id, new Date(Date.now() - DAY_MS));
    if (recent >= DAILY_DOCUMENT_LIMIT) {
      throw new RateLimitedError("You've added the most documents allowed today. Please try again tomorrow.");
    }

    const form = await request.formData();
    const textField = form.get("text");
    const { targetLanguage, text } = fieldsSchema.parse({
      targetLanguage: form.get("targetLanguage"),
      text: typeof textField === "string" && textField.trim() ? textField : undefined,
    });

    if (text) {
      const document = await createDocument(user.id, {
        fileUrl: PASTED_TEXT_FILE_URL,
        fileName: "Pasted text",
        targetLanguage,
        rawText: text,
      });
      return NextResponse.json({ document }, { status: 201 });
    }

    const upload = form.get("file");
    if (!(upload instanceof File) || upload.size === 0) throw badFile("Please add a photo, a PDF, or some text.");

    const bytes = new Uint8Array(await upload.arrayBuffer());
    const type = detectFileType(bytes);
    if (!type) throw badFile("Please use a JPG, PNG, WebP photo, or a PDF.");
    if (bytes.length > type.maxBytes) throw new AppError("This file is too large.", 413, "PAYLOAD_TOO_LARGE");

    const fileUrl = await storeDocumentFile(user.id, bytes, type);
    const document = await createDocument(user.id, {
      fileUrl,
      fileName: upload.name.slice(0, 255) || `Document.${type.extension}`,
      targetLanguage,
    });
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "POST /api/documents");
  }
}
