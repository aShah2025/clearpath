import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { parseRecordId } from "@/lib/data/ids";

/*
 * Tenant-scoped access to action items. Same contract as documents.ts: the
 * userId comes from requireUser() and is part of every query.
 */

const RESOURCE = "Action item";

const timelineItemSelect = {
  id: true,
  documentId: true,
  title: true,
  description: true,
  dueDate: true,
  consequence: true,
  priority: true,
  position: true,
  isCompleted: true,
  document: { select: { fileName: true } },
} satisfies Prisma.ActionItemSelect;

export type TimelineItem = Prisma.ActionItemGetPayload<{ select: typeof timelineItemSelect }>;

/**
 * The user's action items across all documents: dated items soonest first,
 * then undated ones in each document's order.
 */
export async function listTimeline(
  userId: string,
  options: { includeCompleted?: boolean } = {},
): Promise<TimelineItem[]> {
  return getPrisma().actionItem.findMany({
    where: { userId, ...(!options.includeCompleted && { isCompleted: false }) },
    select: timelineItemSelect,
    orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { documentId: "asc" }, { position: "asc" }],
    take: 200,
  });
}

export async function setActionItemCompleted(
  userId: string,
  actionItemId: string,
  isCompleted: boolean,
): Promise<TimelineItem> {
  const id = parseRecordId(actionItemId, RESOURCE);
  const prisma = getPrisma();

  return prisma.$transaction(async (tx) => {
    // updateMany lets the owner check live in the WHERE clause; a count of 0
    // means the item does not exist or belongs to someone else.
    const { count } = await tx.actionItem.updateMany({
      where: { id, userId },
      data: { isCompleted },
    });
    if (count === 0) throw new NotFoundError(RESOURCE);

    return tx.actionItem.findFirstOrThrow({ where: { id, userId }, select: timelineItemSelect });
  });
}
