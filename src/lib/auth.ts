import "server-only";
import { cache } from "react";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { UnauthorizedError } from "@/lib/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
};

/**
 * The signed-in user, or null. Identity comes only from the verified Supabase
 * JWT (`getClaims`), never from request input. On first sight of a user, a
 * matching `users` row is created so foreign keys resolve.
 *
 * Memoized per request: repeated calls during one render hit Supabase and the
 * database once.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;

  const { sub: id, email } = data.claims;
  if (!id || !email) return null;

  return ensureUserRecord(id, email);
});

/** The signed-in user; throws UnauthorizedError when there is none. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

const userSelect = { id: true, email: true, name: true } as const;

async function ensureUserRecord(id: string, email: string): Promise<CurrentUser> {
  const prisma = getPrisma();

  const existing = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (existing) {
    if (existing.email === email) return existing;
    // Email changed in Supabase Auth; keep our copy in sync.
    return prisma.user.update({ where: { id }, data: { email }, select: userSelect });
  }

  try {
    return await prisma.user.create({ data: { id, email }, select: userSelect });
  } catch (error) {
    // Two concurrent first requests for the same user: the other one won.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const created = await prisma.user.findUnique({ where: { id }, select: userSelect });
      if (created) return created;
    }
    throw error;
  }
}
