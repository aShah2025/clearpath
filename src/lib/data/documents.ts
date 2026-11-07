import "server-only";
import { Prisma, type DocumentStatus, type Priority } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { parseRecordId } from "@/lib/data/ids";

/*
 * Tenant-scoped access to documents. Every function takes the owner's userId
 * (from requireUser(), never from request input) and every query filters on
 * it. Route handlers and components must use these functions instead of the
 * raw Prisma client.
 */

const RESOURCE = "Document";

const documentSummarySelect = {
  id: true,
  fileName: true,
  status: true,
  targetLanguage: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DocumentSelect;

const actionItemSelect = {
  id: true,
  title: true,
  description: true,
  dueDate: true,
  consequence: true,
  priority: true,
  position: true,
  isCompleted: true,
} satisfies Prisma.ActionItemSelect;

const documentDetailSelect = {
  ...documentSummarySelect,
  fileUrl: true,
  plainSummary: true,
  detectedLanguage: true,
  actionItems: { select: actionItemSelect, orderBy: { position: "asc" } },
} satisfies Prisma.DocumentSelect;

export type DocumentSummary = Prisma.DocumentGetPayload<{ select: typeof documentSummarySelect }>;
export type DocumentDetail = Prisma.DocumentGetPayload<{ select: typeof documentDetailSelect }>;

export type CreateDocumentInput = {
  fileUrl: string;
  fileName: string;
  targetLanguage?: string;
};

export type ActionItemInput = {
  title: string;
  description: string;
  dueDate: Date | null;
  consequence: string;
  priority: Priority;
};

export type DocumentAnalysisInput = {
  rawText: string;
  plainSummary: string;
  detectedLanguage: string | null;
  actionItems: ActionItemInput[];
};

const MAX_PAGE_SIZE = 50;

export async function listDocuments(
  userId: string,
  options: { limit?: number; cursor?: string } = {},
): Promise<{ documents: DocumentSummary[]; nextCursor: string | null }> {
  const limit = Math.min(Math.max(options.limit ?? 20, 1), MAX_PAGE_SIZE);
  const cursor = options.cursor ? parseRecordId(options.cursor, RESOURCE) : undefined;

  const rows = await getPrisma().document.findMany({
    where: { userId },
    select: documentSummarySelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    // The cursor goes through the compound key so it can only point at a row
    // this user owns.
    ...(cursor && { cursor: { id_userId: { id: cursor, userId } }, skip: 1 }),
  });

  const hasMore = rows.length > limit;
  const documents = hasMore ? rows.slice(0, limit) : rows;
  return { documents, nextCursor: hasMore ? documents[documents.length - 1].id : null };
}

export async function getDocument(userId: string, documentId: string): Promise<DocumentDetail> {
  const id = parseRecordId(documentId, RESOURCE);
  const document = await getPrisma().document.findUnique({
    where: { id_userId: { id, userId } },
    select: documentDetailSelect,
  });
  if (!document) throw new NotFoundError(RESOURCE);
  return document;
}

export async function createDocument(
  userId: string,
  input: CreateDocumentInput,
): Promise<DocumentSummary> {
  return getPrisma().document.create({
    data: {
      userId,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      ...(input.targetLanguage && { targetLanguage: input.targetLanguage }),
    },
    select: documentSummarySelect,
  });
}

export async function updateDocumentStatus(
  userId: string,
  documentId: string,
  status: DocumentStatus,
): Promise<DocumentSummary> {
  const id = parseRecordId(documentId, RESOURCE);
  return withNotFound(() =>
    getPrisma().document.update({
      where: { id_userId: { id, userId } },
      data: { status },
      select: documentSummarySelect,
    }),
  );
}

/**
 * Stores the AI analysis and replaces the document's action items in one
 * transaction, then marks the document COMPLETED.
 */
export async function saveDocumentAnalysis(
  userId: string,
  documentId: string,
  analysis: DocumentAnalysisInput,
): Promise<DocumentDetail> {
  const id = parseRecordId(documentId, RESOURCE);

  return withNotFound(() =>
    getPrisma().$transaction(async (tx) => {
      // Ownership check first; throws P2025 when this user has no such document.
      await tx.document.update({
        where: { id_userId: { id, userId } },
        data: {
          rawText: analysis.rawText,
          plainSummary: analysis.plainSummary,
          detectedLanguage: analysis.detectedLanguage,
          status: "COMPLETED",
        },
        select: { id: true },
      });

      await tx.actionItem.deleteMany({ where: { documentId: id, userId } });
      if (analysis.actionItems.length > 0) {
        await tx.actionItem.createMany({
          data: analysis.actionItems.map((item, position) => ({
            documentId: id,
            userId,
            position,
            title: item.title,
            description: item.description,
            dueDate: item.dueDate,
            consequence: item.consequence,
            priority: item.priority,
          })),
        });
      }

      return tx.document.findUniqueOrThrow({
        where: { id_userId: { id, userId } },
        select: documentDetailSelect,
      });
    }),
  );
}

/** Deletes the document and, by cascade, its action items. */
export async function deleteDocument(userId: string, documentId: string): Promise<void> {
  const id = parseRecordId(documentId, RESOURCE);
  await withNotFound(() =>
    getPrisma().document.delete({ where: { id_userId: { id, userId } }, select: { id: true } }),
  );
}

/** Maps Prisma's "record to update/delete not found" error to NotFoundError. */
async function withNotFound<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new NotFoundError(RESOURCE);
    }
    throw error;
  }
}
