import { z } from "zod";
import { NotFoundError } from "@/lib/errors";

const uuidSchema = z.uuid();

/**
 * Validates a record id from untrusted input. A malformed id is reported as
 * "not found" rather than reaching Postgres, which would reject it with a
 * driver error (a 500).
 */
export function parseRecordId(id: string, resource: string): string {
  const result = uuidSchema.safeParse(id);
  if (!result.success) throw new NotFoundError(resource);
  return result.data;
}
