import "server-only";
import { analyzeDocument } from "@/lib/ai/analyze-document";
import { transcribeFile } from "@/lib/ai/read-file";
import { getDocumentSource, type DocumentDetail } from "@/lib/data/documents";
import { PASTED_TEXT_FILE_URL } from "@/lib/data/constants";
import { readDocumentFile } from "@/lib/storage/documents";

/** Analyzes a document from its pasted text, or by first reading its stored file. */
export async function processDocument(userId: string, documentId: string): Promise<DocumentDetail> {
  const { fileUrl, rawText } = await getDocumentSource(userId, documentId);

  if (fileUrl === PASTED_TEXT_FILE_URL && rawText) {
    return analyzeDocument(userId, documentId, rawText);
  }
  return analyzeDocument(userId, documentId, async () => {
    const { bytes, file } = await readDocumentFile(fileUrl);
    return transcribeFile(bytes, file);
  });
}
